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
	MastersThesis: {},
	Misc: {},
	
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
	},
	
	isInProceedings: function(type) {
		return type == BibType.InProceedings;
	},
	
	isPhDThesis: function(type) {
		return type == BibType.PhDThesis;
	},
	
	isMastersThesis: function(type) {
		return type == BibType.MastersThesis;
	},
	
	isMisc: function(type) {
		return type == BibType.Misc;
	}
}

var BibEntry = function(astentry) {
	var me = this;
	this.type = BibType.getTypeFromStr(astentry.type);
	this.id = astentry.id;
	$.each(astentry.values, function(i, kv) {
		if (kv.key == "author") {
			var authors = kv.value.split(" and ");
			for (var i=0; i < authors.length; i++) {
				authors[i] = BibJS.Util.parseAuthor(authors[i]);
			}
			me["authors"] = authors;
		}
		else {
			me[kv.key] = kv.value;
		}
	});
}

var BibList = function() {
	this.bibentries = new Array();
	this.addEntry = function(entry) {
		this.bibentries.push(entry);
	};
	this.addAuthorLinkMap = function(map) {
		this.authormap = map;
	};
	this.addMyName = function(myname) {
		this.myname = myname;
	}
	this.sort = function(attr, order) {
		attr = BibJS.Util.toArray(attr);
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
	
	Render: function(biblist, htmlid, filter) {
		var year = 0;
		$.each(biblist.bibentries, function(i,entry) {
			var html = "";
			
			filter = BibJS.Util.toArray(filter);
			var toRender = false;
			$.each(filter, function(i, attr) {
				if (entry[attr] != undefined) {
					toRender = true;
				}
			});
			
			if (filter.length != 0 && !toRender) {
				return true;
			}
			
			// link authors names
			if (entry.authors) {
				for (var i=0; i < entry.authors.length; i++) {
					if (biblist.authormap && biblist.authormap[entry.authors[i]]) {
						entry.authors[i] = "<a style='color: #000;' href='"+biblist.authormap[entry.authors[i]]+"' >"+entry.authors[i]+"</a>";
					}
					if (biblist.myname && entry.authors[i] == biblist.myname) {
						entry.authors[i] = "<strong>"+entry.authors[i]+"</strong>";
					}
				}
			}
			
			
			if (year != entry.year) {
				year = entry.year;
				html += "<dt>"+entry.year+"</dt>";
				html += "<dd></dd>";
			}
			if (BibType.isArticle(entry.type)) {
				html += BibJS.RenderArticle(entry);
			}
			else if (BibType.isInProceedings(entry.type)) {
				html += BibJS.RenderInProceedings(entry);
			}
			else if (BibType.isPhDThesis(entry.type)) {
				html += BibJS.RenderPhDThesis(entry);
			}
			else if (BibType.isMastersThesis(entry.type)) {
				html += BibJS.RenderMastersThesis(entry);
			}
			else if (BibType.isMisc(entry.type)) {
				html += BibJS.RenderMisc(entry);
			}
			
			$(htmlid).append(html);
			$(htmlid).append("<div style='margin-bottom: 10px;'></div>");
			
		});
	},
	
	RenderArticle: function(entry) {
		var html = "";
		html += "<dd><em>"+BibJS.Util.arrayToString(entry.authors, ", ")+"</em></dd><dd><strong>"+BibJS.Util.renderTitle(entry)+"</strong></dd><dd>"+entry.journal+"</dd>";
		return html;
	},
	
	RenderInProceedings: function(entry) {
		var html = "";
		html += "<dd><em>"+BibJS.Util.arrayToString(entry.authors, ", ")+"</em></dd>";

		html += "<dd><strong>"+BibJS.Util.renderTitle(entry)+"</strong>";
		if (entry.alert != undefined) {
			html += "<span style='margin-left: 10px;' class='label label-success'>"+entry.alert+"</span></dd>";
		}
		else {
			html += "</dd>";
		}
		html += "<dd>"+entry.booktitle+"</dd>";
		
		return html;
	},
	
	RenderPhDThesis: function(entry) {
		var html = "";
		html += "<dd><em>"+BibJS.Util.arrayToString(entry.authors, ", ")+"'s PhD thesis</em></dd><dd><strong>"+BibJS.Util.renderTitle(entry)+"</strong></dd><dd>"+entry.school+"</dd>";
		return html;
	},
	
	RenderMastersThesis: function(entry) {
		var html = "";
		html += "<dd><em>"+BibJS.Util.arrayToString(entry.authors, ", ")+"'s MSc thesis</em></dd><dd><strong>"+BibJS.Util.renderTitle(entry)+"</strong></dd><dd>"+entry.school+"</dd>";
		return html;
	},
	
	RenderMisc: function(entry) {
		var html = "";
		html += "<dd><em>"+BibJS.Util.arrayToString(entry.authors, ", ")+"</em></dd><dd><strong>"+BibJS.Util.renderTitle(entry)+"</strong></dd><dd>"+entry.howpublished+"</dd>";
		return html;
	},
	
	Util: {
        renderTitle: function(entry) {
            var title = "";
            if (entry.doi != undefined) title = '<a href="http://dx.doi.org/'+entry.doi+'">'+entry.title+"</a>";
            else if (entry.url != undefined) title = '<a href="'+entry.url+'">'+entry.title+"</a>";
            else title = entry.title;
            return title;
        },

		clean: function(array, deleteValue) {
		    for (var i = 0; i < array.length; i++) {
		      if (array[i] == deleteValue) {         
		        array.splice(i, 1);
		        i--;
		      }
		    }
		    return array;
		},
		
		toArray: function(val) {
			if (val == undefined || val == null) {
				return [];
			}
			if (!Array.isArray(val)) {
				val = [val];
			}
			return val;
		},
		
		arrayToString: function(arr, sep) {
			var i;
			var str = "";
			for (i=0; i < arr.length; i++) {
				if (i > 0)
					str += sep;
				str += arr[i];
			}
			return str;
		},
		
		parseAuthor: function(author) {
			var idx = author.search(",");
			if (idx == -1) {
				// name already in format first ... last
				return author;
			}
			else {
				// name in format last, first ...
				var t = author.split(",");
				return t[1].trim()+" "+t[0].trim();
			}
		}
	}
	
}
