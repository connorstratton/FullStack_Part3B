require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express();

morgan.token('body', request => JSON.stringify(request.body));

app.use(express.json())
app.use(express.static('dist'))

app.use(morgan((tokens, request, response) => {
    const base = `${tokens.method(request, response)}` +
    `${tokens.url(request, response)}` +
    `${tokens.status(request, response)}` +
    `${tokens.res(request, response, 'content-length')}` +
    `${tokens['response-time'](request, response)} ms`;

    if (request.method === 'POST') {
        return `${base} ${tokens.body(request)}`;
    }

    return base;
}))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date().toString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
    
    //const id = request.params.id
    //const person = persons.find(person => person.id === id)

    /**
    if (!person)
    {
        response.status(400).end()
    }
    else{
        response.json(person)
    }
         */
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name)
    {
        return response.status(400).json({error: 'no name given'})
    }
    if (!body.number)
    {
        return response.status(400).json({error: 'no number given'})
    }
    const names = persons.map(person => person.name);
    if (names.includes(body.name))
    {
        return response.status(400).json({error: 'name must be unique'})
    }

    const person = new Person({
        id: Math.floor(Math.random() * 100).toString(),
        name: body.name,
        number: body.number
    })


    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})