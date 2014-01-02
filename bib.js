/*
Copyright 2014 Ricardo J. Dias

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


var BibAST = {
	Entry: function(type, id, values) {
		this.type = type;
		this.id = id;
		this.values = values;
	},
	KeyValue: function(key, value) {
		this.key = key;
		this.value = value;
	}
}

var BibType = {
	Article: {},
	InProceedings: {},
	PhDThesis: {},
	
	getTypeFromStr: function(str) {
		var kk = Object.getOwnPropertyNames(BibType);
		for (i=0; i < kk.length-1; i++) {
			if (str == kk[i].toLowerCase()) {
				return BibType[kk[i]];
			}
		}
		return null;
	},
	
	isArticle: function(type) {
		return type == BibType.Article;
	}
}

var BibEntry = function(astentry) {
	var me = this;
	this.type = BibType.getTypeFromStr(astentry.type);
	this.id = astentry.id;
	$.each(astentry.values, function(i, kv) {
		me[kv.key] = kv.value;
	});
}

var BibList = function() {
	this.bibentries = new Array();
	this.addEntry = function(entry) {
		this.bibentries.push(entry);
	};
	this.sort = function(attr, order) {
		if (!Array.isArray(attr)) {
			attr = [attr];
		}
		this.bibentries.sort(function(a,b) {
			for (var i=0; i < attr.length; i++) {				
				if (a[attr[i]] < b[attr[i]]) return order == 'DESC' ? 1 : -1
				if (a[attr[i]] > b[attr[i]]) return order == 'DESC' ? -1 : 1;
			}
			return 0;
		});
	};
}

var BibJS = {
	Init: function(bibfile, finish_callback) {
		var list = new BibList();
		$.get('scripts/bibtex_grammar.pegjs', function(data) {
			var parser = PEG.buildParser(data);
			$.get(bibfile, function(data) {
				var astentries = parser.parse(data);
				$.each(astentries, function(i,astentry) {
					list.addEntry(new BibEntry(astentry));
				});
				finish_callback(list);
			}, 'text');
		}, 'text');
	},
	
	Render: function(biblist, htmlid) {
		var year = 0;
		$.each(biblist.bibentries, function(i,entry) {
			if (year != entry.year) {
				year = entry.year;
				$(htmlid).append("<dt>"+entry.year+"</dt>");
			}
			//if (BibType.isArticle(entry.type)) {
				var html = BibJS.RenderArticle(entry);
				$(htmlid).append(html);
			//}
		});
	},
	
	RenderArticle: function(entry) {
		var html = "";
		html += "<dd>"+entry.author+"</dd><dd><strong>"+entry.title+"</strong></dd><dd>"+entry.journal+", ("+entry.year+")</dd>";
		return html;
	},
	
	Util: {
		clean: function(array, deleteValue) {
		    for (var i = 0; i < array.length; i++) {
		      if (array[i] == deleteValue) {         
		        array.splice(i, 1);
		        i--;
		      }
		    }
		    return array;
		}
	}
	
}
