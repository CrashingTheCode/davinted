const csv = require("csv");
const fs = require("fs");
const { parse } = require("csv-parse");

const { sequelize, User,Product ,Iteration} = require("./models/products.model")



// sequelize
//   .authenticate()
//   .then(() => console.log('Connection has been established successfully.'))
//   .catch(err => console.error('Unable to connect to the database:', err));

// or whatever you want for initial iteration
Iteration.create({current:0})

var DataArray = []

fs.createReadStream("./csv productsManual.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", async(row) =>{
    console.log(row[0]);
    // await extraxtFolderNameAndFileName(row)
    let brand = row[6];
    // console.log(brand,'Pull&Bear',brand=='Pull&Bear')
    if(brand=='Pull&Bear'){
      // console.log('true')
      brand = 'Pull & Bear'
    }
    let size = row[7]
    if(size=='One size' || size==' One size'){
      size = 'Talla única'
    }
    
    Product.create({
      Vendedor: row[0],
      SKU: row[1],
      Sexo: row[2],
      Tags: row[3],
      vendedor2: row[4],
      Nombre: row[5],
      Marca: brand,
      Talla: size,
      Categoría: row[8],
      Subcategoría: row[9],
      Estilo: row[10],
      Estilo_2: row[11],
      Color: row[12],
      Color_optional: row[13],
      Precio_Influ: row[14],
      Inventory: row[15],
      noof_Fotos: row[16],
      Precio_Final: row[17],
      Fecha: row[18],
      Descripción: row[19],
      Fecha: row[20],

    })
  })


const extraxtFolderNameAndFileName = async (prodDetails) =>{
  let sku = prodDetails[1]
  console.log(sku)

}




// const dataExtract = async () =>{
//   let data1 = fs.readFileSync("./csv productsManual.csv",(err,data)=>{
//     console.log(data,err)

//   })
//   let data2 = await parse(data1,{ delimiter: ",", from_line: 2 })
//   console.log('data1',data2)
// }
// dataExtract()