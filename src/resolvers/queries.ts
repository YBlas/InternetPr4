import { ApolloServer, ApolloError } from "apollo-server"
import { typeDefs } from "../schema"
import { Collection } from "mongodb";
import { Usuario, Ingrediente, Receta } from "../types";
import { v4 as uuidv4 } from "uuid";
const ObjectId = require('mongodb').ObjectId;

export const Query = {
    test: (): string => "Y yo estoy aquí probandote!",

    //Se crea token único para la sesión guardado en las variables de entorno .env
    LogIn: async (parent: any, args: { email: string, pwd: string }, context: { coleccionUsers: Collection }) => {
        let UserDB: Usuario = await context.coleccionUsers.findOne({ email: args.email, pwd: args.pwd }) as Usuario;
        if (UserDB) {
            const token1 = uuidv4();
            //Actualizamos token del usuario en la base de datos
            context.coleccionUsers.findOneAndUpdate({ email: args.email, pwd: args.pwd }, { $set: { token: token1 } });
            process.env.token = token1;
            console.log(process.env.token);
            return true;
        } else {
            console.log(`Error, usuario con mail ${args.email} no registrado o contraseña incorrecta`);
            return false;
        }
    },

    //ELimina el token que identoficaba al usuario
    LogOut: (): string => {
        if (!process.env.token) {
            return "Usuario no loggeado"
        }
        else {
            const token = process.env.token;
            delete process.env.token;
            return `Desloggeando sesión con token ${token}`
        }
    },

    getUser: async (parent: any, args: { id: string }, context: { coleccionUsers: Collection }) => {
        var id = args.id;
        var good_id = new ObjectId(id);
        let UserDB: Usuario = await context.coleccionUsers.findOne({ _id: good_id }) as Usuario;
        if (UserDB) {
            return {
                id: UserDB._id,
                email: UserDB.email,
                token: UserDB.token
            }
        } else {
            console.log(`Error, no existe un usuario con id ${args.id}`)
        }
    },

    getUsers: async (parent: any, args: any, context: { coleccionUsers: Collection }) => {
        const UsersDB = await context.coleccionUsers.find().toArray();
        const UsersQL = UsersDB.map(elem => {
            const itUser = {
                id: elem._id,
                email: elem.email,
                token: elem.token
            }
            return itUser;
        })
        return UsersQL;
    },

    getRecipe: async (parent: any, args: { id: string }, context: { coleccionRecetas: Collection }) => {
        var id = args.id;
        var good_id = new ObjectId(id);
        let RecetaDB: Receta = await context.coleccionRecetas.findOne({ _id: good_id }) as Receta;
        console.log(RecetaDB);
        return {
            id: RecetaDB._id,
            name: RecetaDB.name,
            description: RecetaDB.description,
            ingredients: RecetaDB.ingredients,
            author: RecetaDB.author
        }
    },

    getRecipes: async (parent: any, args: { author: string, ingredient: string[] }, context: { coleccionRecetas: Collection }) => {
        //En caso de no recibir ningún argumento devuelve todas las recetas
        if (!args.author && !args.ingredient) {
            const RecipesDB = await context.coleccionRecetas.find().toArray();
            const RecipesQL = RecipesDB.map(elem => {
                const itRecipe = {
                    id: elem._id,
                    name: elem.name,
                    author: elem.author,
                    description: elem.author,
                    ingredients: elem.ingredients
                }
                return itRecipe;
            })
            return RecipesQL;
        //Si recibe solo el autor devuelve todas las recetas creadas por ese autor
        } else if (args.author && !args.ingredient) {
            var id = args.author;
            var good_id = new ObjectId(id);
            const RecipesDB = await context.coleccionRecetas.find({ author: good_id }).toArray();
            const RecipesQL = RecipesDB.map(elem => {
                const itRecipe = {
                    id: elem._id,
                    name: elem.name,
                    author: elem.author,
                    description: elem.author,
                    ingredients: elem.ingredients
                }
                return itRecipe;
            })
            return RecipesQL;
        //En caso de recibir un array de ingredientes devuelve todas las recetas que contengan todos esos ingredientes.
        } else if (!args.author && args.ingredient) {
            const RecipesDB = await context.coleccionRecetas.find({ ingredients: {$all: args.ingredient} }).toArray();
            const RecipesQL = RecipesDB.map(elem => {
                const itRecipe = {
                    id: elem._id,
                    name: elem.name,
                    author: elem.author,
                    description: elem.author,
                    ingredients: elem.ingredients
                }
                return itRecipe;
            })
            return RecipesQL;
        //En caso de recibir tanto autor como ingrdeiente devuelve las recetas creadas por ese autor y que contengan toda la lista de ingredientes recibida.
        } else if (args.author && args.ingredient) {
            var id = args.author;
            var good_id = new ObjectId(id);
            const RecipesDB = await context.coleccionRecetas.find({author: good_id , ingredients: {$all: args.ingredient} }).toArray();
            const RecipesQL = RecipesDB.map(elem => {
                const itRecipe = {
                    id: elem._id,
                    name: elem.name,
                    author: elem.author,
                    description: elem.author,
                    ingredients: elem.ingredients
                }
                return itRecipe;
            })
            return RecipesQL;
        }
    } 
}



