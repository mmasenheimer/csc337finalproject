//User setup
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "name", "email", "password", "type"],
      properties: {
        userId: { bsonType: "int" },
        name: { bsonType: "string"},
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        type : {bsonType: "string"}
      },
    },
  },
});


//Carts setup
//Might want to introduce totalCost: as a field here, 
db.createCollection("carts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "books"],
      properties: {
        userId: { bsonType: "int" },      
        books: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["isbn", "title", "author"],
            properties: {
              isbn: { bsonType: "string" },
              title: { bsonType: "string" },
              author: { bsonType: "string" }
            }
          }
        }
      }
    }
  }
});


//if you want to drop after editing script
// db.tablename.drop()
//then rerun the setup script


//Books set up
db.createCollection("books", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["isbn", "title", "author", "price"],
      properties: {
        isbn: { bsonType: "string" },
        title: { bsonType: "string" },
        author: { bsonType: "string" },
        price: { bsonType: "double" }   
      }
    }
  }
});
const bookList = [
  {
    isbn: "978-0-141-43951-8",
    title: "1984",
    author: "George Orwell",
    price: 16.50
  },
  {
    isbn: "978-0-544-27299-6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 21.99
  },
  {
    isbn: "978-0-375-70667-7",
    title: "No Country for Old Men",
    author: "Cormac McCarthy",
    price: 15.99
  },
  {
    isbn: "978-0-307-74365-9",
    title: "The Stand",
    author: "Stephen King",
    price: 18.99
  },
  {
    isbn: "978-0-7653-7654-2",
    title: "Dune",
    author: "Frank Herbert",
    price: 19.99
  },
  {
    isbn: "978-0-143-03943-3",
    title: "The Grapes of Wrath",
    author: "John Steinbeck",
    price: 17.50
  },
  {
    isbn: "978-0-062-31609-6",
    title: "The Martian",
    author: "Andy Weir",
    price: 14.99
  }
];

const admins = [
  {
    userId: 1,
    name: "Admin",
    email: "admin@admin.com",
    password: "admin123",
    type: "admin"
  },
  {
    userId: 2,
    name: "Dan Smith",
    email: "dmsith123@gmail.com",
    password: "admin123",
    type: "admin"
  }


]

//Create indices for fast lookups:
db.users.createIndex({ email: 1 }, { unique: true });
db.books.createIndex({ isbn: 1 }, { unique: true });
db.carts.createIndex({ userId: 1 });


//insert products into books
for (var book of bookList){
  db.books.insertOne(book)
}

console.log("length of admins" + admins.length)

//insert admins into users
for (var adm of admins){
  db.users.insertOne(adm)
}