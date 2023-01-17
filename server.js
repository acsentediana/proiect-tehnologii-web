const express = require('express')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'student.db'
})

const Student = sequelize.define('student', {
  name: Sequelize.STRING,
  class: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [3, 10]
    }
  }
})
sequelize.sync({ alter: true })
  .then(() => {
    console.log('tables created')
  })

const app = express()

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url)
  next()
})

app.use(express.static('public'))

app.use(express.json())

app.get('/students', async (req, res, next) => {
  try {
    const students = await Student.findAll()
    res.status(200).json(students)
  } catch (error) {
    next(error)
  }
})

app.post('/students', async (req, res, next) => {
  try {
    const student = await Student.create(req.body)
    res.status(201).json(student)
  } catch (error) {
    next(error)
  }
})

app.get('/students/:id', async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (student) {
      res.status(200).json(student)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.put('/students/:id', async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (student) {
      student.class = req.body.class
      student.name = req.body.name
      await student.save()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }      
  } catch (error) {
    next(error)
  }
})

app.delete('/students/:id', async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (student) {
      await student.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
      
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.warn(err)
  res.status(500).json({ message: 'server error' })
})

app.listen(8080)