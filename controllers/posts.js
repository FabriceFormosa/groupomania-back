const {prisma} = require('../db/db.js')
//const { getUser }  = require('../controllers/users')

async function getPosts(req,res)
{
    try
    {
        const email = req.email
        
        // const user = getUsers(email)
        // console.log("getPosts user :",user)
        
        const user = await prisma.Users.findUnique({where: {email: email}})
        
        //console.log("getPosts user :",user)
        
        const allPosts = await prisma.Posts.findMany(
            {
                include:{
                    comments:
                    {
                        orderBy:{
                            createdAt:"asc"
                        },
                        include:{
                            user:
                            {
                                select:
                                {
                                    email: true                            ,
                                    name:true,
                                    lastName:true,
                                    avatar:true,
                                    service:true,
                                    admin:true
                                }
                            }
                        }
                        
                    },
                    
                    user:
                    {
                        select:
                        {
                            email: true                            ,
                            name:true,
                            lastName:true,
                            avatar:true,
                            service:true,
                            admin:true
                        }
                    }
                },
                orderBy: {
                    createdAt:"desc"
                }
                
            }
            
            );

            allPosts.forEach(post => {
                var mydate = post.createdAt
               // test = test.split('T')[1]
               // console.log( "format date ISO :" ,mydate)

                var date = new Date(mydate);
                var dt = date.getDate();
                var month = (date.getMonth()+1);
                var hr = date.getUTCHours();
                var min = date.getMinutes();
                if (dt < 10) {
                    dt = '0' + dt;
                  }
                  if (month < 10) {
                    month = '0' + month;
                  }
                mydate = "Posté le: "+dt +'-' + month + '-' +date.getFullYear()+' à '+hr+'h:'+min;
                //console.log( "format date std :" ,mydate)
                post.createdAt=mydate;

                post.comments.forEach(comment => {
                    var commentCreateAt = comment.createdAt
                    // test = test.split('T')[1]
                    // console.log( "comment format date ISO :" ,commentCreateAt)
     
                     var date = new Date(commentCreateAt);
                     var dt = date.getDate();
                     var month = (date.getMonth()+1);
                     var hr = date.getUTCHours();
                     var min = date.getMinutes();
                     if (dt < 10) {
                         dt = '0' + dt;
                       }
                       if (month < 10) {
                         month = '0' + month;
                       }
                       comment.createdAt = dt +'-' + month + '-' +date.getFullYear()+' à '+hr+'h:'+min;
                     //  commentCreateAt = dt +'-' + month + '-' +date.getFullYear();
                     //console.log( "format date std :" ,mydate)
                    // post.comments.createdAt=commentCreateAt;      


                });
            });
            // allPosts.forEach(post => {
            //     console.log( "format date :" ,post.createdAt.split("T")[0])
            //     //post.createdAt = post.createdAt.split("T")[0];
            // });

            res.send({posts:allPosts,email,user})
        }
        catch(error)
        {
            res.status(500).send({error})
        }
        
    }
    
    async function createPost(req, res)
    {
        try
        {
            console.log("req.file : ",req.file)
            const content = req.body.content;
            const hasImage=req.file != null
            const url = hasImage ? createImageurl(req):undefined
            
            
            const email = req.email;
            //  console.log("email : ",email)
            const userId = await prisma.Users.findUnique( {where: {email}})
            //  console.log("userId : ",userId)
            const post= {content,imageUrl:url,userId:userId.id}
            //   console.log("post : ",post)
            const result  = await prisma.Posts.create({data:post})
            //  console.log("result : ",result)
            
            res.send({post:result})
        }
        catch(error)
        {
            res.status(500).send({error})
        }
        
    }
    
    // function deleteComments(comments)
    // {
    
    //     comments.forEach((comment) => {
    
    //         dbComments.forEach((dbcomment) => {
    
    //             if( comment.id === dbcomment.id)
    //             console.log("delete comment ",comment.id,dbcomment.id)
    //         })
    
    //     })
    // }
    
    
    // async function deleteAllPost(req, res) {
    
    //     const {posts,email} = getPosts()
    
    // }
    
    async function deletePost(req, res) {
        
        // Id du post
        const postId=Number(req.params.id)
        
        const post = await prisma.Posts.findUnique( 
            {
                where: {id:postId},
                include:{   
                    user:{
                        select:{email:true}
                    }
                }
            })
            
            console.log("deletePost post:",post)
            
            // test existence du post
            if( post ==null)
            return res.status(404).send({error:"Post not found"})
            
            // test appartenance du post au user
            const  email = req.email
            if ( email != post.user.email )
            return res.status(404).send({error:"Not owner of this post"})
            
            // delete the comments
            const nbCommentDeleted = await prisma.Comments.deleteMany( {where : {postId:post.id}}) //  
            console.log("deletePost nbCommentDeleted : ",nbCommentDeleted)
            
            /// delete the post
            await prisma.Posts.delete( {where : {id:post.id}}) 
            
            res.send({  message:"Post deleted"})    
            // const postindex = posts.indexOf( post)
            
            // console.log("post.comments :",post.comments)
            // deleteComments(post.comments)
            
            // posts.splice(postindex,1)
            
            //console.log("posts ",posts)
            //res.send({message:`Post ${postId} was deleted successfully`,posts:posts})
            
            
        }
        
        function createImageurl(req){
            console.log("createImageurl ",req.file.path)
            let pathToImage=req.file.path.replace("\\","/")
            const protocol = req.protocol
            const host = req.get("host")
            return `${protocol}://${host}/${pathToImage}`
        }
        
    /********************************************************************************************************** */    
        async function createComment(req,res){
            
            try{
                // id du post
                console.log("createComment postId : ",req.params.id)    
                const postId=Number(req.params.id)
                
                // recup du post avec l id 
                const post = await prisma.Posts.findUnique( {where: {id:postId}})
                
                console.log("post :", post  )
                
                // test existence du post
                if( post ==null)
                return res.status(404).send({error:"Post not found"})
                
                //  recupération du userId
                const email = req.email;
                console.log("email : ",email)
                const userId = await prisma.Users.findUnique( {where: {email}})
                
                //le post existe , ajout du commentaire
                const commentToSend = { content:req.body.comment,postId:post.id,userId:userId.id}
                //console.log(typeof(post.id))
                //console.log(typeof(post.userId))
                //console.log("commentToSend : " ,commentToSend   )
                
                const comment = await prisma.Comments.create({data:commentToSend})
                
                //const id = Math.random( ).toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) // genere un id aleatoire
                //const user = req.email
                //const commentToSend = {"content":req.body.comment,"postId":req.params.id}
                //console.log("commentToSend : " + commentToSend   )
                
                //const postId=req.params.id
                //const post = posts.find( (post)  => post.id === postId)
                
                //const commentCreated = await prisma.Comments.create({data:commentToSend})
                
                //console.log("comment : " + comment   )
                
                // const result = await prisma.Posts.findUnique( {where: {postId}})
                // console.log("result : " + result   )
                
                //if( post ==null)
                //return res.status(404).send({error:"Post not found"})
                
                //post.comments.push(commentToSend)
                
                //console.log(post)
                res.send({comment})
            }
            catch(error)
            {
                res.status(500).send({error})
            }
            
        }
        
        async function updatePost(req,res)
        {
            console.log(" updatePost " )
            try{
                const postId=Number(req.params.id)

                console.log(" updatePost postId",postId )

                const contentUpdated = req.body.contentUpdated

                console.log(" updatePost contentUpdated",contentUpdated )

               
                const post = await prisma.Posts.findUnique({where: {id: postId}})
            
                if (post == null)
                {
                    return res.status(404).send({error:"Post not found"})
                }
                    
                console.log("post found",post)
                
                const updatePost = await prisma.Posts.update({
                    where: {
                    id: postId,
                    },
                    data: {
                        content:contentUpdated
                    }

                })
                res.send({updatePost:updatePost,message:'post updated'}) 
            }
            catch(error)
            {
                res.status(500).send({error})
            }
            
            

        }
        
        
        module.exports = { getPosts,createPost,createComment,deletePost,updatePost}