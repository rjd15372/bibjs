BibJS v0.1.1
=====

A bibtex parser and renderer to easily publish your publications in your homepage.


## Dependencies:

* PEG.js
* jQuery
* Booststrap CSS


## Usage:

html file:
```html
<html>
  <head>
    <link href="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <div class="container">
      <h3>Selected Publications <small><a id="see-all-publ" href="#list">(see all)</a></small></h3> 
      <dl id="bibtex_list" class="dl-horizontal">
      </dl>
    </div>
    
    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
	  <script src="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
	  <script type="text/javascript" src="peg-0.8.0.js"></script>
	  <script type="text/javascript" src="bib.js"></script>
	  <script type="text/javascript" src="myscript.js"></script>
  </body>
</html>
```

myscript.js:
```javascript
$( document ).ready(function() {
	BibJS.Init('bibtex_file.bib', 'grammar_location', function(biblist) {
		biblist.sort(['year', 'month'], 'DESC');
		biblist.addMyName("My Name");
		biblist.addAuthorLinkMap({
			"Leslie Lamport": "http://www.lamport.org/" 
		});
		BibJS.Render(biblist, "#bibtex_list", "selected"); // only shows selected publications
		$('#see-all-publ').click(function() {
			$('#bibtex_list').empty();
			BibJS.Render(biblist, "#bibtex_list"); // no filters, shows all
		});
	});
```

You can add new tags to your bibtex entries and use them as filters. In the example above I used the tag "selected" to choose which bibtex entries are displayed by default. 

Example of bibtex entry:
```
@article{greenwade93,
    author  = {George D. Greenwade},
    title   = {The {C}omprehensive {T}ex {A}rchive {N}etwork ({CTAN})},
    year    = {1993},
    journal = {TUGBoat},
    volume  = {14},
    number  = {3},
    pages   = {342--351},
    selected = {true}
}

@inproceedings{Kawazoe08,
  author    = {Marcos Kawazoe Aguilera and Eli Gafni and Leslie Lamport},
  title     = {The Mailbox Problem},
  booktitle = {DISC},
  year      = {2008},
  pages     = {1-15}
}
```
Filters ignore the values of tags.


