require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(cors())
app.use(express.static('dist'))

morgan.token('custom-token', function (req, res) {
  if(req.method === 'POST') return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :custom-token'))
app.use(express.json())

const generateId = () => {
  return Math.floor(Math.random() * 10000)
}

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.post('/api/persons', (req, res , next) => {
  const data = req.body

  if(!data.name || !data.number){
    return res.status(400).json({error: 'data missing'})
  }

  Person.find({ name: data.name }).then(result => {
    if(result.length > 0){
      return res.status(409).json({message: 'Person already exists'})
    } else {
      const newPerson = new Person({
        number: data.number,
        name: data.name
      })
      newPerson.save().then(result => {
        res.json(result)
      }).catch(error => next(error))
    }
  })
  
  
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  
  Person.findById( id ).then(result => {
    if(result) {
      return res.status(200).json(result)
    } else {
      return res.status(404).json({ message: 'person not found' })
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log(id)
  Person.findByIdAndDelete(id).then(result => {
    res.status(200).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:name', (req, res, next) => {
  const name = req.params.name
  const body = req.body

  const person = {
    name: name,
    number: body.number,
  }

  Person.findOneAndUpdate(
      { name: name }, 
      person, 
      { new: true, runValidators: true, context: 'query' })
    .then(result => {
    
    res.status(200).json(result)
  })
  .catch(error => next(error))
})

app.get('/info', (req, res) => {
  return res.json({ message: 'under maintenance' })
  const totalPeople = persons.length
  const date = Date()
  res.send(`<p>Phonebook has info for 
    ${totalPeople} people</p>
    <p>${date}</p>`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)