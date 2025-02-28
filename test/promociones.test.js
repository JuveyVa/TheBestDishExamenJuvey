const DishModel = require("../models/dishes.model").DishModel
const OrderModel = require("../models/order.model").OrderModel
const order = require("../controllers/order.controller")

const platillo1 = new DishModel({
    dishName: "Hamburguesa",
    price: 35,
    type: "Alimento"
})

const platillo2 = new DishModel({
    dishName: "Hot Dog",
    price: 20,
    type: "Alimento"
})

const platillo3 = new DishModel({
    dishName: "Pizza",
    price: 50,
    type: "Alimento"
})

const platillo4 = new DishModel({
    dishName: "Pepsi",
    price: 25,
    type: "Bebida"
})

const platillo5 = new DishModel({
    dishName: "Coca",
    price: 5,
    type: "Bebida"
})

const platillo6 = new DishModel({
    dishName: "Horchata",
    price: 30,
    type: "Bebida"
})

describe('Pruebas unitarias', () => {
    describe('Dado que existan valores nulos o numeros negativos debera de lanzar un error', () => {
        it('debera de regresar un error si algun elemento en el arreglo de dishes es nulo', () => {
            const newOrder = {
                clientName: "Fernando",
                dishes: [platillo1, null, platillo1, platillo1],
                total: 105,
                codigoPromocional: "BIENVENIDA"
            };
        
            expect(() => {order.descuentoIgualesMasPrecio(newOrder);}).toThrow("El arreglo de platillos contiene elementos nulos o indefinidos");
        })
    })
    describe('Dado que existan 3 platillos iguales en la orden', () => {
        it('debera agregar al total solamente el costo de 2 ellas', () => {
            const newOrder = {
                clientName: "Gustavo",
                dishes: [platillo1, platillo1, platillo1],
                total: 105,
                codigoPromocional: "NO TIENE"
            };

            const totalConDescuento = order.descuentoIguales(newOrder);
            
            expect(totalConDescuento).toBe(70);

        })
        it('El descuento no podrá ser mayor a 20 pesos', () => {
            const newOrder2 = {
                clientName: "Gustavo",
                dishes: [platillo1, platillo1, platillo1],
                total: 105,
                codigoPromocional: "NO TIENE"
            };
        
            const totalConDescuento = order.descuentoIgualesMasPrecio(newOrder2);
            
            expect(totalConDescuento).toBe(85);
        })
        it('En caso de que haya 4 comidas en una orden, se debe de aplicar el descuento de las 3 comidas y sumarle el platillo extra extra de la orden', () => {
            const newOrder2 = {
                clientName: "Andrea",
                dishes: [platillo1, platillo1, platillo1, platillo1],
                total: 140,
                codigoPromocional: "NO TIENE"
            };

            const totalConDescuento = order.descuentoIgualesMasPrecio(newOrder2);
            
            expect(totalConDescuento).toBe(120);
        })
    })
    describe('Dado que existan dos bebidas iguales en la orden', () => {
        it('Deberá de agregar al total solamente el costo de una de ellas', () => {
            const newOrder = {
                clientName: "Ernesto",
                dishes: [platillo4, platillo4],
                total: 50,
                codigoPromocional: "NO TIENE"
            };

            const totalConDescuento = order.descuentoIguales(newOrder);
            
            expect(totalConDescuento).toBe(25);

        })
        it('Se debe de aplicar el descuento correcto si no supera el limite de 10 pesos', () => {
            const newOrder2 = {
                clientName: "Andrea",
                dishes: [platillo5, platillo5],
                total: 10,
                codigoPromocional: "NO TIENE"
            };

            const totalConDescuento = order.descuentoIgualesMasPrecio(newOrder2);
            
            expect(totalConDescuento).toBe(5);
        })
        it('En caso de que haya 3 bebidas en una orden ,se debe de aplicar el descuento de las dos bebidas y sumarle la extra de la orden', () => {
            const newOrder2 = {
                clientName: "Andrea",
                dishes: [platillo5, platillo5, platillo5],
                total: 15,
                codigoPromocional: "NO TIENE"
            };

            const totalConDescuento = order.descuentoIgualesMasPrecio(newOrder2);
            
            expect(totalConDescuento).toBe(10);
        })
    })
    describe('Dado que existan más de dos promociones en la orden', () => {
        it('Debera aplicar solamente una promocion, aquella que suponga más ahorro al usuario', () => {
                const newOrder2 = {
                    clientName: "Erick",
                    dishes: [platillo3, platillo3, platillo3, platillo1, platillo1, platillo1],
                    total: 255,
                    codigoPromocional: "NO TIENE"
                    
                };
    
                const totalConDescuento = order.descuentoIgualesMasPrecio(newOrder2);
                
                expect(totalConDescuento).toBe(235);
        })
    })
    describe('Dado que tengan un código promocional', () => {
        it('Deberá ser aplicado solamente si no existe alguna promoción dentro de la orden', () => {
            const newOrder = {
                clientName: "Carlos",
                dishes: [platillo1, platillo1, platillo1],
                total: 105,
                codigoPromocional: "BIENVENIDA"
            };
        
            expect(() => {order.descuentoIgualesMasPrecio(newOrder);}).toThrow("No se puede aplicar un codigo promocional porque ya existe una promoción en la orden");

            newOrder.codigoPromocional = "NO TIENE";
            let totalConDescuento = order.descuentoIgualesMasPrecio(newOrder);
            expect(totalConDescuento).toBe(85); 
        });
        it('Deberá de permitir aplicar solamente un código promocional por orden', () => {
            const newOrder = {
                clientName: "Eduardo",
                dishes: [platillo1, platillo2, platillo3],
                total: 105, 
                codigoPromocional: "NO TIENE"
            };
        
            let totalConDescuento = order.aplicarCodigoPromocional(newOrder, "BIENVENIDA");
        
            totalConDescuento = order.aplicarCodigoPromocional(newOrder, "REFRESCATE");
        
            expect(totalConDescuento).toBe(73.5);
        });
        it('Deberá  de  restar  el  30%  de  la  orden  si  el  código  es  igual  a “BIENVENIDA" ', () => {
            const newOrder = {
                clientName: "Karen",
                dishes: [platillo1, platillo2, platillo3],
                total: 105,
                codigoPromocional: "NO TIENE"
            };
        
            let totalConDescuento = order.aplicarCodigoPromocional(newOrder, "BIENVENIDA");
        
            expect(totalConDescuento).toBe(73.5);
        });
        it('Deberá de restar el precio de la bebida más cara si el código es igual a “REFRESCATE" ', () => {
            const newOrder = {
                clientName: "Karen",
                dishes: [platillo1, platillo2, platillo4, platillo5],
                total: 85,
                codigoPromocional: "NO TIENE"
            };
        
            let totalConDescuento = order.aplicarCodigoPromocional(newOrder, "REFRESCATE");
        
            expect(totalConDescuento).toBe(60);
        });
        it('Deberá de restar el precio del platillo y la bebida más barata si el código es “COMBO" ', () => {
            const newOrder = {
                clientName: "Karen",
                dishes: [platillo1, platillo2, platillo4, platillo5],
                total: 85,
                codigoPromocional: "NO TIENE"
            };
        
            let totalConDescuento = order.aplicarCodigoPromocional(newOrder, "COMBO");
        
            expect(totalConDescuento).toBe(60);
        });
        it('Deberá  de  restar  el  precio  de  las  dos  bebidas  y  los  dos platillos más caros si el código es igual a “PAREJA” ', () => {
            const newOrder = {
                clientName: "Karen",
                dishes: [platillo1, platillo3, platillo2, platillo4, platillo5, platillo6],
                total: 165,
                codigoPromocional: "NO TIENE"
            };
        
            let totalConDescuento = order.aplicarCodigoPromocional(newOrder, "PAREJA");
        
            expect(totalConDescuento).toBe(25);
        });
    })
}) 