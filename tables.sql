CREATE TABLE "listing" ( "id" INTEGER, "user" INTEGER, "item" INTEGER, "price" INTEGER, "quantity" INTEGER, FOREIGN KEY("user") REFERENCES "users"("id"), FOREIGN KEY("item") REFERENCES "product"("id"), PRIMARY KEY("id" AUTOINCREMENT) );

CREATE TABLE "product" ( "id" INTEGER, "name" TEXT, "description" TEXT, "type" TEXT, PRIMARY KEY("id" AUTOINCREMENT) );

CREATE TABLE sqlite_sequence(name,seq);

CREATE TABLE "transactions" ( "id" INTEGER, "nameid" INTEGER, "item" INTEGER, "quantity" INTEGER, "price" INTEGER, "itemName" TEXT, FOREIGN KEY("item") REFERENCES "product"("id"), FOREIGN KEY("nameid") REFERENCES "users"("id"), PRIMARY KEY("id" AUTOINCREMENT) );

CREATE TABLE "users" ( "id" INTEGER, "username" TEXT, "password" TEXT, "monies" INTEGER, "email" TEXT, "sessionId" TEXT, PRIMARY KEY("id" AUTOINCREMENT) );