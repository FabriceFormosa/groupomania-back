


const comment1={
    id:"comment1",
    user:"zozo1@wanadoo.fr",
    content:"content comment de zozo1"
}

const comment2={
    id:"comment2",
    user:"zozo2@wanadoo.fr",
    content:"content comment de zozo2"
}

const comment3={
    id:"comment3",
    user:"zozo3@wanadoo.fr",
    content:"content comment de zozo3"
}

const post1 ={id:"1",user:"zozo1@wanadoo.fr",
content:"content post de zozo1",
imageUrl:"https://picsum.photos/200/100",
comments:[comment1,comment2,comment3]}

const post2 ={id:"2",user:"zozo2@wanadoo.fr",
content:"content post de zozo2",
imageUrl:"https://picsum.photos/200/100",
comments:[comment1,comment3]}


const post3 ={id:"3",user:"zozo3@wanadoo.fr",
content:"content post de zozo3",
imageUrl:"https://picsum.photos/200/100",
comments:[]}


const  posts=[post1,post2,post3];


function getPosts(req,res)
{
    const email = req.email
    res.send({posts,email})
}

function createPost(req, res)
{
    console.log("req.body",req.body)
    console.log("req.file",req.file)

const content = req.body.content;
const hasImage=req.file != null
const url = hasImage ? createImageurl(req):null

const email = req.email;

const post= {content,user:email,comments:[],imageUrl:url,id:(posts.length+1).toString()}
posts.unshift(post)

console.log("createPost :",post)
res.send({post})

}

function createImageurl(req){
    console.log("createImageurl ",req.file.path)
    let pathToImage=req.file.path.replace("\\","/")
    const protocol = req.protocol
    const host = req.get("host")
    return `${protocol}://${host}/${pathToImage}`
}


function createComment(req,res){
    console.log("createComment postId : ",req.params.id)
   
      
    
    const id = Math.random( ).toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) // genere un id aleatoire
    const user = req.email
    const commentToSend = {id,user,content:req.body.comment}

    const postId=req.params.id
    const post = posts.find( (post)  => post.id === postId)
    if( post ==null)
    return res.status(404).send({error:"Post not found"})

    post.comments.push(commentToSend)
    
    console.log(post)
    res.send({post})
 
    //res.send("test createComment")

    // const postId=req.params.id
    // const comment=req.body.comment  
    // const post = posts.find( (post)  => post.id === postId)

    // console.log("post: ",post)

    // const id = Math.random( ).toString(36).substring(2,15) + Math.random().toString(36)
    // const user = req.email
    // const comment = {id,user,content}
    // post.comments.push(comment)
    // res.send({post})
}




module.exports = { getPosts,createPost,createComment}