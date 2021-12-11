import { ApolloServer, ApolloError } from "apollo-server"
import { typeDefs } from "./schema"
import { Query } from "./resolvers/queries"
import { Mutation, Recipe } from "./resolvers/mutations"
import { connectMongo } from "./functions"


const resolvers = {
    Query,
    Recipe,
    Mutation
}

const run = async () => {
    //Como mencionado en la función de conexión, cambiar nombre de colecciones para que cuadre con su propia base de datos mongoDB.
    const coleccionUsers = (await connectMongo()).collection("UsersQL"); 
    const coleccionIngredientes = (await connectMongo()).collection("IngredientesQL"); 
    const coleccionRecetas = (await connectMongo()).collection("RecetasQL"); 
    const server = new ApolloServer({
        typeDefs, resolvers,
        context: ({ req, res }) => {
            // if(req.body.query.includes("LogOut")){
            //     console.log(process.env.token);
            // }
            return {
                coleccionUsers,
                coleccionIngredientes,
                coleccionRecetas
            }
        }
    });

    process.env.puerto = "6969";
    const PORT = process.env.puerto;
    server.listen(PORT).then(() => {
        console.log(`Listening to PORT ${PORT}`);
    })

}

run();