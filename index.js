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

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(count => {
        const info = `<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toString()}</p>`
        response.send(info)
    }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
            response.status(204).end()
        }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findById(request.params.id).then(person => {
        if (!person){
            return response.status(404).exit()
        }

        person.name = name
        person.number = number
        
        return person.save().then((updatedPerson) => {
            response.json(updatedPerson)
        })
    }).catch(error => next(error))
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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError'){
        return response.status(400).send({ error: 'maformatted id' })
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})