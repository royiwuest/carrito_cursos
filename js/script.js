class Curso{
    constructor(nombre, id, tipo, precio, descripcion){
        this.nombre = nombre;
        this.id = id;
        this.tipo = tipo;
        this.precio = precio;
        this.descripcion = descripcion;
    }
}


// Local storage
const cursos = JSON.parse(localStorage.getItem("cursos")) || [] 
let carrito = JSON.parse(localStorage.getItem("carrito")) || []
const inscripcion = JSON.parse(localStorage.getItem("inscripcion")) || []

const agregarCurso = ({nombre, id, tipo, precio, descripcion})=>{
    if(cursos.some(cur=>cur.id===id)){
        Swal.fire('El curso ya existe!')
    } else {
        const cursoNuevo = new Curso(nombre, id, tipo, precio, descripcion);
        cursos.push(cursoNuevo);
        localStorage.setItem('cursos', JSON.stringify(cursos))
    }
}

const totalCarrito = ()=>{
    let total = carrito.reduce((acumulador, {precio, cantidad})=>{
        return acumulador + (precio*cantidad);
    }, 0)
    return total
}

const totalCarritoRender = ()=>{
    const carritoTotal = document.getElementById("carritoTotal");
    carritoTotal.innerHTML=`Precio total: $ ${totalCarrito()}`;
}

// agrega cursos al carrito
const agregarCarrito = (objetoCarrito)=>{
    carrito.push(objetoCarrito);
    totalCarritoRender()
}


//Borra el contenido anterior y renderiza el carrito
const renderizarCarrito = ()=>{
    const listaCarrito = document.getElementById("listaCarrito");
    listaCarrito.innerHTML="";
    carrito.forEach(({nombre, precio, cantidad, id}) =>{
        let elementoLista = document.createElement("li");
        elementoLista.innerHTML=`Curso: ${nombre} * Precio del curso: $ ${precio} * Cantidad:${cantidad} <button id="eliminarCarrito${id}">Eliminar</button>`;
        listaCarrito.appendChild(elementoLista);
        const botonBorrar = document.getElementById(`eliminarCarrito${id}`);
        botonBorrar.addEventListener("click",()=>{
            carrito = carrito.filter((elemento)=>{
                if(elemento.id !== id){
                    return elemento
                }
            })
            let carritoString = JSON.stringify(carrito);
            localStorage.setItem("carrito", carritoString);
            renderizarCarrito()
            Swal.fire({
                icon: 'warning',
                title: `Eliminó el curso ${nombre} del carrito`,
                showConfirmButton: true,
                timer: 2500
            })
        })
        let carritoString = JSON.stringify(carrito);
        localStorage.setItem("carrito", carritoString);
    })
}

const borrarCarrito = ()=>{
    carrito.length = 0 
    let carritoString = JSON.stringify(carrito);
    localStorage.setItem("carrito", carritoString);
    renderizarCarrito()
}

//renderiza el DOM
const renderizarCursos = (arrayUtilizado)=>{
    const contenedorCursos = document.getElementById("contenedorCursos")
    contenedorCursos.innerHTML = "";
    arrayUtilizado.forEach(({nombre, id, tipo, precio, descripcion})=>{
        const curCard = document.createElement("div")
        curCard.classList.add("col-xs")
        curCard.classList.add("card")
        curCard.style = "width: 300px;height:570px; margin:20px"
        curCard.id = id
        curCard.innerHTML = `
                <img src="/img/${id}.JPG" alt="${nombre}">
                <div class="card-body">
                    <h5 class="card-title">${nombre}</h5>
                    <h6>${tipo}</h6>
                    <p class="card-text">${descripcion}</p>
                    <span>Precio: $ ${precio}</span>
                    <form id="form${id}">
                        <label for="contador${id}">Cantidad</label>
                        <input tipo="number" placeholder="0" id="contador${id}">
                        <button class="btn btn-primary" id="botonCur${id}">Agregar</button>
                    </form>
                </div>`
        contenedorCursos.appendChild(curCard)
        const boton = document.getElementById(`botonCur${id}`)
        boton.addEventListener("click",(e)=>{
            e.preventDefault()
            const contadorCantidad = Number(document.getElementById(`contador${id}`).value)
            if(contadorCantidad>0){
                agregarCarrito({nombre, id, tipo, precio, descripcion, cantidad:contadorCantidad})
                renderizarCarrito()
                const form = document.getElementById(`form${id}`)
                form.reset()
                Swal.fire({
                    icon: 'success',
                    title: `Agregó el curso ${nombre} al carrito`,
                    showConfirmButton: true,
                    timer: 2500
                })
            }
        }) 
    })
}


const cursoExtistente = async ()=>{
    // si el array de cursos esta vacio, hace un fetch a cursos
    if (cursos.length===0){
        try{
            const URLCursos = "/cursos.json"
            const cursosBasePuro = await fetch(URLCursos)
            const cursosBase = await cursosBasePuro.json()
            cursosBase.forEach(cur=>{
            let dato = JSON.parse(JSON.stringify(cur));
            agregarCurso(dato)})
        } catch(err){
            console.log("Se produjo un error.");
        }finally{
            renderizarCursos(cursos)
        }
    }else{
        renderizarCursos(cursos)
    }
}



const comprar = (event)=>{
    const data = new FormData(event.target);
    const cliente = Object.fromEntries(data);

    //Se genera ticket
    const idTicket = inscripcion.length
    const ticket = {cliente: cliente, total:totalCarrito(), id:inscripcion.length, cursos:carrito};
    inscripcion.push(ticket);

    //Se guarda en el localStorage
    localStorage.setItem("inscripcion", JSON.stringify(inscripcion));
    borrarCarrito();
    Swal.fire({
        icon: 'info',
        title: "Muchas gracias por su compra! En breve nos pondremos en contacto con Usted.",
       
    })

    let mensaje = document.getElementById("carritoTotal");
    mensaje.innerHTML = ""

};

// DOM
const compraFinal = document.getElementById("formCompraFinal")
compraFinal.addEventListener("submit",(event)=>{
    event.preventDefault()
    if(carrito.length>0){
        comprar(event)
    } else {
        Swal.fire('Carrito Vacío')
    }
});



const app = ()=>{
    cursoExtistente();
    renderizarCarrito();
    totalCarritoRender();
};


app()