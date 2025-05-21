const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('dist'))

var persons = [
  {
    "name": "Arto Hellas",
    "number": "58",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

morgan.token('custom-token', function (req, res) {
  if(req.method === 'POST') return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :custom-token'))
app.use(express.json())

const generateId = () => {
  return Math.floor(Math.random() * 10000)
}

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.post('/api/persons', (req, res) => {
  const data = req.body

  if(!data.name || !data.number){
    return res.status(400).json({error: 'data missing'})
  }

  const checkExistantName = persons.filter(person => person.name === data.name)
  if(checkExistantName.length > 0){
    return res.status(400).json({error: 'name already exists'})
  }

  const newPerson = {
    id: generateId(),
    number: data.number,
    name: data.name
  }
  persons = persons.concat(newPerson)

  res.send(newPerson)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  
  const findPerson = persons.filter(person => person.id === id)
  if(findPerson){
    res.status(200).json(findPerson)
  }else{
    res.status(404)
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  
  persons = persons.filter(person => person.id !== id)
  res.status(200).end()
})

app.get('/info', (req, res) => {
  const totalPeople = persons.length
  const date = Date()
  res.send(`<p>Phonebook has info for 
    ${totalPeople} people</p>
    <p>${date}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)