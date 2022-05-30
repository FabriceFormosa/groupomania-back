*** Groupomania 
This is the backend for the Groupomania project

*** Technologies used
-Node.js,Express,JW,Multer
-MySQL hosted on Planetscale
-Prisma for ORM

*** How to use
1 git clone this repository
2 npm install 
3 rename .env.development file into .env
4 populate it with your personal settings environment
5 this repository was tested with an online Planetscale MySQL database

*** How to use Prisma with Database
the db schema is inside the schema.prisma file
if you want to change it you have to run the following command 'npx prisma db push'