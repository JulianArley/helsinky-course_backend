const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url =
  `mongodb+srv://fullstack:${password}@cluster0.vtfllvr.mongodb.net/peopleApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', phonebookSchema)

if(process.argv.length === 5){
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(res => {
    console.log('note saved', res)
    mongoose.connection.close()
  })
}else if(process.argv.length === 3){
  Person.find({}).then(people => {
    console.log('phonebook:')
    people.map(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}
