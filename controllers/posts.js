const {prisma} = require('../db/db.js')


// const comment1={
//     id:"comment1",
//     user:"zozo1@wanadoo.fr",
//     content:"content comment de zozo1"
// }

// const comment2={
//     id:"comment2",
//     user:"zozo2@wanadoo.fr",
//     content:"content comment de zozo2"
// }

// const comment3={
//     id:"comment3",
//     user:"zozo3@wanadoo.fr",
//     content:"content comment de zozo3"
// }
// const comment4={
//     id:"comment4",
//     user:"zozo2@wanadoo.fr",
//     content:"content comment de zozo2"
// }
// const comment5={
//     id:"comment5",
//     user:"zozo1@wanadoo.fr",
//     content:"content comment de zozo1"
// }

// const post1 ={id:"1",user:"zozo1@wanadoo.fr",
// content:"content post de zozo1",
// imageUrl:"https://picsum.photos/200/100",
// comments:[comment1,comment2,comment3]}

// const post2 ={id:"2",user:"zozo2@wanadoo.fr",
// content:"content post de zozo2",
// imageUrl:"https://picsum.photos/200/100",
// comments:[comment4,comment5]}


// const post3 ={id:"3",user:"zozo3@wanadoo.fr",
// content:"content post de zozo3",
// imageUrl:"https://picsum.photos/200/100",
// comments:[]}


// const dbComments=[comment1,comment2,comment3,comment4,comment5]


// const  posts=[post1,post2,post3];


async function getPosts(req,res)
{
    try
    {
        const email = req.email
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
                                    email: true
                                }
                            }
                        }
                        
                    },
                    
                    user:
                    {
                        select:
                        {
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt:"desc"
                }
                
            }
            
            );
            res.send({posts:allPosts,email})
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
            const content = req.body.content;
            const hasImage=req.file != null
            const url = hasImage ? createImageurl(req):undefined
            
            const email = req.email;
            console.log("email : ",email)
            const userId = await prisma.Users.findUnique( {where: {email}})
            console.log("userId : ",userId)
            const post= {content,imageUrl:url,userId:userId.id}
            console.log("post : ",post)
            const result  = await prisma.Posts.create({data:post})
            console.log("result : ",result)
            
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
            console.log(typeof(post.id))
            console.log(typeof(post.userId))
            console.log("commentToSend : " ,commentToSend   )
            
            const comment = await prisma.Comments.create({data:commentToSend})
            
            //const id = Math.random( ).toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) // genere un id aleatoire
            //const user = req.email
            //const commentToSend = {"content":req.body.comment,"postId":req.params.id}
            //console.log("commentToSend : " + commentToSend   )
            
            //const postId=req.params.id
            //const post = posts.find( (post)  => post.id === postId)
            
            //const commentCreated = await prisma.Comments.create({data:commentToSend})
            console.log("comment : " + comment   )
            
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
    
    
    
    
    module.exports = { getPosts,createPost,createComment,deletePost}