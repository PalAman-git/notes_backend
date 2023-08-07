require('dotenv').config(); //for loading the variables declared in .env file
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const Note = require('./models/note');

//the middlewares
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};
const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error:'malformatted id' });
	}else if(error.name === 'ValidationError')
	{
		return response.status(400).json({error: error.message});
	}

	next(error);
};

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('build'));

app.get('/api/notes', (req, res) => {
	Note.find({}).then((notes) => res.json(notes));
});

app.post('/api/notes', (request, response,next) => {
	const body = request.body;

	const note = new Note({
		content: body.content,
		important: body.important || false,
	});

	note.save()
		.then((savedNote) => {
			response.json(savedNote);
		})
		.catch((error) => next(error));
});

app.get('/api/notes/:id', (request, response,next) => {
	Note.findById(request.params.id)
		.then((note) => {
			if(note)
			{
				response.json(note);
			}else{
				response.status(404).end();
			}
		})
		.catch((err) => {
			next(err);
		});

});

app.delete('/api/notes/:id', (request, response,next) => {
	Note.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch(error => next(error));
});

//when we perform the put requests, the validation are not by default executed so we have to do this
//this can be easily fixed by the code below
app.put('/api/notes/:id', (request, response, next) => {
	const { content,important } = request.body;

	Note.findByIdAndUpdate(request.params.id, { content,important }, { new: true, runValidators:true, context:'query' })
		.then(updatedNote => {
			response.json(updatedNote);
		})
		.catch(error => next(error));
});

app.use(unknownEndpoint); // this has to be the second last middleware.
app.use(errorHandler); // this has to be the last loaded middleware.


// eslint-disable-next-line no-undef
const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
