// see

var express = require('express');
var bodyParser = require('body-parser'),
	ejs = require('ejs'),
	methodOverride = require('method-override'),
	pg = require("pg");


var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method')); 

// Refactor connection and query code
var db = require("./models");

// Article Routes!

// shows all articles 
app.get('/articles', function(req,res) {
  db.Article
  	.findAll({ include: db.Author })
  	.then(function(dbArticles) {
  		res.render('articles/index', { articlesList: dbArticles });
  	});
});

// renders the new article page/form
app.get('/articles/new', function(req,res) {
	// First, we have to get the authors that we can add to the form as a dropdown
	db.Author.all().then(function(dbAuthors) {
		res.render('articles/new', { ejsAuthors: dbAuthors });		
	});
  
});

// create new article functionality
app.post('/articles', function(req,res) {
  db.Article
  	.create(req.body.article)
  	.then(function(dbArticle) {
  		res.redirect('/articles');
  	});
});

// shows a particular article
app.get('/articles/:id', function(req, res) {
  db.Article.find({ where: { id: req.params.id }, include: db.Author })
  	.then(function(dbArticle) {
  		res.render('articles/article', { articleToDisplay: dbArticle });
  	});
  
});

// render edit page for article
app.get('/articles/:id/edit', function(req, res) {
	var id = req.params.id;
	db.Article.find(id)
	.then(function(dbArticle) {
		res.render('articles/edit', {article: dbArticle});
	});
});

// edit functionality for article
app.put('/articles/:id', function(req, res) {
	var id = req.params.id;
	var formArticle = req.body.article;

	db.Article.find(id)
		.then(function(dbArticle) {
			dbArticle.updateAttributes(formArticle)
			.then(function(newArticle) {
				res.redirect('/articles/'+newArticle.id);
			});
		});
});

// Creating delete action for article
app.delete('/articles/:id', function(req,res){
	// Grabbing the id from the URL Param ID
	var id = req.params.id;

	// Find the article with the id in the url
	db.Article.find(id)
	  .then(function(dbArticle){
	  	// Delete the article 
	  	dbArticle.destroy()
	  	  .then(function(){
	  	  	// Send us articles home
	  	  	res.redirect('/articles');
	  	  });
	  });
});

// Author Routes!

// shows all authors
app.get('/authors', function(req, res) {
	db.Author
		.all()
		.then(function(dbAuthors) {
			res.render('authors/index', { ejsAuthors: dbAuthors} );
		});
});

// renders new author page/form
app.get('/authors/new', function(req, res) {
	res.render('authors/new');
});

// create new author functionality
app.post('/authors', function(req, res) {
	db.Author
		.create(req.body.author)
		.then(function(dbAuthor) {
			res.redirect('/authors');
		});
});

// shows a particular author
app.get('/authors/:id', function(req, res) {
	db.Author
		.find({ where: {id: req.params.id}, include: db.Article })
		.then(function(dbAuthor) {
			res.render('authors/author', { ejsAuthor: dbAuthor });
		});
});

// renders edit page for author
app.get('/authors/:id/edit', function(req, res) {
	var id = req.params.id;
	db.Author.find(id)
	.then(function(dbAuthor) {
		res.render('authors/edit', {author: dbAuthor});
	});
});


// edit functionality for author
app.put('/authors/:id', function(req, res) {
	var id = req.params.id;
	var formAuthor = req.body.author;

	db.Author.find(id)
		.then(function(dbAuthor) {
			dbAuthor.updateAttributes(formAuthor)
			.then(function(newAuthor) {
				res.redirect('/authors/'+newAuthor.id);
			});
		});
});

// Deletes an author

// Creating delete action for article
app.delete('/authors/:id', function(req,res){
	// Grabbing the id from the URL Param ID
	var id = req.params.id;

	// Find the author with the id in the url
	db.Author.find(id)
	  .then(function(dbAuthor){
	  	// Delete the author
	  	dbAuthor.destroy()
	  	  .then(function(){
	  	  	// Send us authors home
	  	  	res.redirect('/authors');
	  	  });
	  });
});


app.get('/', function(req,res) {
  res.render('site/index.ejs');
});

app.get('/about', function(req,res) {
  res.render('site/about');
});

app.get('/contact', function(req,res) {
  res.render('site/contact');
});

app.get('/sync', function(req, res) {
	db.sequelize.sync().then(function() {
		res.send("Sequelize Synchronization is Complete!");
	})
});

app.listen(3000, function() {
  console.log('Listening, Yo');
});