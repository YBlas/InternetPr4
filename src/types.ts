export type Usuario = {
    _id: string,
    email: string,
    token: string
}

export type Ingrediente = {
    _id: string,
    name: string,
    author: string
}

export type Receta = {
    _id: string,
    name: string,
    description: string,
    ingredients: string[],
    author: string,
}