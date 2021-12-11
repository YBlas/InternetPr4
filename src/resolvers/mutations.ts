import { ApolloServer, ApolloError } from "apollo-server"
import { typeDefs } from "../schema"
import { Collection } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { Usuario, Ingrediente, Receta } from "../types";
const ObjectId = require('mongodb').ObjectId;

export const Mutation = {

    SignIn: async (parent: any, args: { email: string, pwd: string }, context: { coleccionUsers: Collection }) => {
        let UserDB: Usuario = await context.coleccionUsers.findOne({ email: args.email }) as Usuario;
        if (UserDB) {
            console.log(`Error, ya existe usuario con mail ${args.email}`);
        } else {
            context.coleccionUsers.insertOne({
                email: args.email,
                pwd: args.pwd,
                token: uuidv4()
            })
            console.log(args.email);
        }

        UserDB = await context.coleccionUsers.findOne({ email: args.email }) as Usuario;
        return {
            id: UserDB._id,
            email: UserDB.email,
            token: UserDB.token
        }
    },

    AddIngredient: async (parent: any, args: { name: string }, context: { coleccionIngredientes: Collection, coleccionUsers: Collection }) => {
        if (!process.env.token) {
            console.log("Usuario no loggeado");
        } else {
            let IngredienteDB: Ingrediente = await context.coleccionIngredientes.findOne({ name: args.name }) as Ingrediente;
            if (IngredienteDB) {
                console.log(`Error, ya existe un ingrediente llamado ${args.name}`);
            } else {
                let UserDB: Usuario = await context.coleccionUsers.findOne({ token: process.env.token }) as Usuario;
                context.coleccionIngredientes.insertOne({
                    name: args.name,
                    author: UserDB._id
                })
            }
            IngredienteDB = await context.coleccionIngredientes.findOne({ name: args.name }) as Ingrediente;
            return {
                _id: IngredienteDB._id,
                name: IngredienteDB.name,
                author: IngredienteDB.author
            }
        }
    },

    AddRecipe: async (parent: any, args: { name: string, description: string, ingredients: string[] }, context: { coleccionIngredientes: Collection, coleccionUsers: Collection, coleccionRecetas: Collection }) => {
        if (!process.env.token) {
            console.log("Usuario no loggeado");
        } else {
            let RecetaDB: Receta = await context.coleccionRecetas.findOne({ name: args.name }) as Receta;
            if (RecetaDB) {
                console.log(`Error, ya existe una receta llamada ${args.name}`);
            } else {
                let UserDB: Usuario = await context.coleccionUsers.findOne({ token: process.env.token }) as Usuario;
                context.coleccionRecetas.insertOne({
                    name: args.name,
                    author: UserDB._id,
                    description: args.description,
                    ingredients: args.ingredients
                })
            }
            RecetaDB = await context.coleccionRecetas.findOne({ name: args.name }) as Receta;
            return {
                id: RecetaDB._id,
                name: RecetaDB.name,
                author: RecetaDB.author,
                description: RecetaDB.description,
                ingredients: RecetaDB.ingredients
            }
        }
    },

    SignOut: async (parent: any, args: any, context: { coleccionUsers: Collection, coleccionRecetas: Collection }) => {
        if (!process.env.token) {
            console.log("Usuario no loggeado");
            return false;
        } else {
            let UserDB: Usuario = await context.coleccionUsers.findOne({ token: process.env.token }) as Usuario;
            var id = UserDB._id;
            var good_id = new ObjectId(id);
            context.coleccionRecetas.deleteMany({ author: good_id });
            context.coleccionUsers.deleteOne({ token: process.env.token });
            return true;
        }
    },

    DeleteRecipe: async (parent: any, args: { id: string }, context: { coleccionUsers: Collection, coleccionRecetas: Collection }) => {
        if (!process.env.token) {
            console.log("Usuario no loggeado");
            return false;
        } else {
            let UserDB: Usuario = await context.coleccionUsers.findOne({ token: process.env.token }) as Usuario;
            var id = args.id;
            var good_id = new ObjectId(id);
            var good_id2 = new ObjectId(UserDB._id);
            context.coleccionRecetas.deleteOne({ _id: good_id, author: good_id2});
            return true;
        }
    },

    UpdateRecipe: async (parent: any, args: {name: string, description: string, ingredients: string[]}, context: { coleccionUsers: Collection, coleccionRecetas: Collection }) => {
        if (!process.env.token) {
            console.log("Usuario no loggeado");
        } else {
            let UserDB: Usuario = await context.coleccionUsers.findOne({ token: process.env.token }) as Usuario;
            var id = UserDB._id;
            var good_id = new ObjectId(id);
            context.coleccionRecetas.updateOne({ name: args.name, author: good_id }, { $set: { name: args.name, description: args.description, ingredients: args.ingredients } });
            const RecetaDB : Receta = await context.coleccionRecetas.findOne({ name: args.name }) as Receta;
            return {
                id: RecetaDB._id,
                name: RecetaDB.name,
                author: RecetaDB.author,
                description: RecetaDB.description,
                ingredients: RecetaDB.ingredients
            }
        }
    },

    DeleteIngredient: async (parent: any, args: {id: string}, context: {coleccionIngredientes: Collection, coleccionUsers: Collection, coleccionRecetas: Collection})=>{
        if (!process.env.token) {
            console.log("Usuario no loggeado");
            return false;
        } else {
            let UserDB: Usuario = await context.coleccionUsers.findOne({ token: process.env.token }) as Usuario;
            var id = args.id;
            var good_id = new ObjectId(id);
            const IngredientDB : Ingrediente = await context.coleccionIngredientes.findOne({ _id: good_id }) as Ingrediente;
            if(UserDB._id.toString === IngredientDB.author.toString){
                context.coleccionRecetas.deleteMany({ingredients: {$all: [IngredientDB.name]}});
                context.coleccionIngredientes.deleteOne({name: IngredientDB.name});
                return true;
            }else{
                return false;
            }
            
        }
    }
}

export const Recipe = {
    ingredients: async (parent: { ingredients: string[] }, args: any, context: { coleccionIngredientes: Collection, coleccionUsers: Collection }) => {
        const Ingredientes: Ingrediente[] = await Promise.all(parent.ingredients.map(async (elem) => {
            let IngredienteDB: Ingrediente = await context.coleccionIngredientes.findOne({ name: elem }) as Ingrediente;
            return IngredienteDB;
        }));
        return Ingredientes;
    }
}