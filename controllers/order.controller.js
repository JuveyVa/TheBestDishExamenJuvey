const OrderModel = require('../models/order.model').OrderModel;

/**
 * Create an empty order with client name
 *
 * @param req Actual Request
 * @param res Actual Response
 */
async function createNewOrder(req, res) {
    let clientName = req.body.clientName;

    let newOrder = await new OrderModel({
        clientName: clientName
    }).save();

    return res.json(newOrder);
}

/**
 * Add dish to existing order
 *
 * @param req Actual Request
 * @param res Actual Response
 */
async function addDish(req, res) {
    let orderId = req.body.orderId;
    let dishId = req.body.dishId;

    await OrderModel.updateOne({"_id": orderId}, {
        $push: {
            dishes : dishId
        }
    });

    let updatedOder = await OrderModel.findOne({_id: orderId});

    return res.json(updatedOder);

}

/**
 * Remove dish to existing order
 *
 * @param req Actual Request
 * @param res Actual Response
 */
async function removeDish(req, res) {
    let orderId = req.body.orderId;
    let dishId = req.body.dishId;

    await OrderModel.updateOne({"_id": orderId}, {
        $pull: {
            dishes : dishId
        }
    });

    let updatedOder = await OrderModel.findOne({_id: orderId});

    return res.json(updatedOder);

}

/**
 * Get an order by its Id
 *
 * @param req Actual Request
 * @param res Actual Response
 */
async function getOrder(req, res){

    let orderId = req.query.orderId;

    let orderObj = await OrderModel.findOne({_id: orderId});

    return res.json(orderObj);
}

function descuentoIguales(order) {
    
    // Validar que ningún elemento en el arreglo sea nulo
    if (order.dishes.some(platillo => platillo === null)) {
        throw new Error("El arreglo de platillos contiene elementos nulos o indefinidos");
    }
    
    const platillosPorNombre = {};
    
    // objeto vacío para agrupar los platillos por nombre.
    order.dishes.forEach(platillo => {
        if (!platillosPorNombre[platillo.dishName]) {
            platillosPorNombre[platillo.dishName] = [];
        }
        platillosPorNombre[platillo.dishName].push(platillo);
    });
    
    let total = 0;
    let promocionAplicada = false;
    
    // Itera a través de cada grupo de platillos con el mismo nombre.
    for (const nombrePlatillo in platillosPorNombre) {
        const platillos = platillosPorNombre[nombrePlatillo];

        // Obtiene el tipo y precio del primer platillo en el grupo (todos los platillos del mismo nombre tendrán el mismo tipo y precio).
        if (platillos.length > 0) {
            const tipoPlatillo = platillos[0].type;
            const precioPlatillo = platillos[0].price;
            
            if (!promocionAplicada) {
                if (tipoPlatillo === "Alimento" && platillos.length === 3) {
                    // Aplicar 3x2 para alimentos
                    total += precioPlatillo * 2;
                    promocionAplicada = true;  // Se aplicó una promoción
                } else if (tipoPlatillo === "Bebida" && platillos.length === 2) {
                    // Aplicar 2x1 para bebidas
                    total += precioPlatillo;
                    promocionAplicada = true;  // Se aplicó una promoción
                } else {
                    // No se aplica promoción, cobrar por todos los artículos
                    total += precioPlatillo * platillos.length;
                }
            } else {
                // Si ya se aplicó una promoción, no aplicar más
                total += precioPlatillo * platillos.length;
            }
        }
    }

    // Validacion para que no haya valores negativos
    if (total < 0) {
        throw new Error("El cálculo del total resultó en un valor negativo");
    }
    
    return total;
};

function descuentoIgualesMasPrecio(order) {
    
    // Validar que ningún elemento en el arreglo sea nulo
    if (order.dishes.some(platillo => platillo === null)) {
        throw new Error("El arreglo de platillos contiene elementos nulos o indefinidos");
    }
    
    const platillosPorNombre = {};

    // objeto vacío para agrupar los platillos por nombre.
    order.dishes.forEach(platillo => {
        if (!platillosPorNombre[platillo.dishName]) {
            platillosPorNombre[platillo.dishName] = [];
        }
        platillosPorNombre[platillo.dishName].push(platillo);
    });
    
    let totalSinDescuentos = 0;
    let posiblesPromociones = [];
    
    // Verificar si ya existe un código promocional aplicado
    if (order.codigoPromocional !== "NO TIENE") {
        throw new Error("No se puede aplicar un codigo promocional porque ya existe una promoción en la orden");
    }
    
    // Itera a través de cada grupo de platillos con el mismo nombre.
    for (const nombrePlatillo in platillosPorNombre) {
        const platillos = platillosPorNombre[nombrePlatillo];
        
        if (platillos.length > 0) {
            const tipoPlatillo = platillos[0].type;
            const precioPlatillo = platillos[0].price;
            
            // Sumar al total sin descuentos
            totalSinDescuentos += platillos.length * precioPlatillo;
            
            if (tipoPlatillo === "Alimento") {
                // Aplicar 3x2 para alimentos
                const gruposDeTres = Math.floor(platillos.length / 3);
                const descuento = gruposDeTres * Math.min(precioPlatillo, 20);
                posiblesPromociones.push({
                    nombre: nombrePlatillo,
                    descuento: descuento
                });
            } else if (tipoPlatillo === "Bebida") {
                // Aplicar 2x1 para bebidas
                const paresDeBebidas = Math.floor(platillos.length / 2);
                const descuento = paresDeBebidas * Math.min(precioPlatillo, 10);
                posiblesPromociones.push({
                    nombre: nombrePlatillo,
                    descuento: descuento
                });
            }
        }
    }
    
    // Si no hay promociones, devolver el total sin descuentos
    if (posiblesPromociones.length === 0) {
        return totalSinDescuentos;
    }
    
    // Ordenar las promociones por descuento
    posiblesPromociones.sort((a, b) => b.descuento - a.descuento);
    
    // Aplicar solo la promoción con mayor descuento
    const mejorPromocion = posiblesPromociones[0];
    return totalSinDescuentos - mejorPromocion.descuento;
}

function aplicarCodigoPromocional(order, codigo) {
    
    // Validar que ningún elemento en el arreglo sea nulo
    if (order.dishes.some(platillo => platillo === null)) {
        throw new Error("El arreglo de platillos contiene elementos nulos o indefinidos");
    }
    
    // Si ya se ha aplicado un código promocional, no permitir aplicar otro
    if (order.codigoPromocional !== "NO TIENE") {
        return order.total; // Si ya tiene un código, no hacer nada más
    }

    // Asignar el código promocional a la orden
    order.codigoPromocional = codigo;

    // Verificar si el código ingresado es uno de los códigos promocionales válidos
    switch (codigo) {
        case "BIENVENIDA":
            // Restar el 30% de la orden
            order.total = order.total * 0.7;
            break;
        case "REFRESCATE":
            // Restar el precio de la bebida más cara
            let bebidaMasCara = obtenerBebidaMasCara(order.dishes);
            order.total = order.total - bebidaMasCara;
            break;
        case "COMBO":
            // Restar el precio del platillo y la bebida más barata
            let platilloMasBarato = obtenerPlatilloMasBarato(order.dishes);
            let bebidaMasBarata = obtenerBebidaMasBarata(order.dishes);
            order.total = order.total - platilloMasBarato - bebidaMasBarata;
            break;
        case "PAREJA":
            // Restar el precio de las dos bebidas y los dos platillos más caros
            let dosBebidasMasCaras = obtenerDosBebidasMasCaras(order.dishes);
            let dosPlatillosMasCaros = obtenerDosPlatillosMasCaros(order.dishes);
            order.total = order.total - dosBebidasMasCaras - dosPlatillosMasCaros;
            break;
        default:
            // Si el código no es válido, no hacer nada
            break;
    }

    return order.total;
}

function obtenerBebidaMasCara(dishes) {
    let bebidas = dishes.filter(dish => dish.type === "Bebida");
    let maxPrecio = Math.max(...bebidas.map(bebida => bebida.price), 0);
    return maxPrecio;
}

// Infinity es cualquier numero infinito, por lo tanto es para manejo de errores y porder usar el min, si hay un numero minimo, se compara con el infinito positivo para saber que si
// regreso un numero y luego ya saca el nnuevo minimo
function obtenerPlatilloMasBarato(dishes) {
    let platillos = dishes.filter(dish => dish.type === "Alimento");
    let minPrecio = Math.min(...platillos.map(platillo => platillo.price), Infinity);
    return minPrecio;
}

// Infinity es cualquier numero infinito, por lo tanto es para manejo de errores y porder usar el min, si hay un numero minimo, se compara con el infinito positivo para saber que si
// regreso un numero y luego ya saca el nnuevo minimo
function obtenerBebidaMasBarata(dishes) {
    let bebidas = dishes.filter(dish => dish.type === "Bebida");
    let minPrecio = Math.min(...bebidas.map(bebida => bebida.price), Infinity);
    return minPrecio;
}

function obtenerDosBebidasMasCaras(dishes) {
    let bebidas = dishes.filter(dish => dish.type === "Bebida");
    bebidas.sort((a, b) => b.price - a.price); // Ordenar de mayor a menor
    return bebidas[0].price + (bebidas[1]?.price || 0); // Sumar las dos más caras
}

function obtenerDosPlatillosMasCaros(dishes) {
    let platillos = dishes.filter(dish => dish.type === "Alimento");
    platillos.sort((a, b) => b.price - a.price); // Ordenar de mayor a menor
    return platillos[0].price + (platillos[1]?.price || 0); // Sumar los dos más caros
}



module.exports = {
    createNewOrder,
    addDish,
    removeDish,
    getOrder,
    descuentoIguales,
    descuentoIgualesMasPrecio,
    aplicarCodigoPromocional
};