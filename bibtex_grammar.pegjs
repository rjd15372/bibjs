start
	= entries:entry* { return BibJS.Util.clean(entries,null); }
	
entry
	= _* "@" type:simple_string _* "{" _* id:string _* "," values:key_value* "}" _* { return new BibAST.Entry(type.toLowerCase(), id, values); }
	/ single_line_comment { return null; }
	
key_value
	= _* key:simple_string _* "=" _* val:value _* { return new BibAST.KeyValue(key.trim().toLowerCase(),val.trim()); }
	
value
	= "{" val:full_string "}" ","?  { return val; }
	
simple_string
	= letters:[a-zA-Z]+ { return letters.join(""); }
	
string
	= str:[-:+*/!@%^&=.a-zA-Z0-9_]+ { return str.join(""); }
	
quoted_string
	= '"' str:[^"\n]+ '"' { return str.join(""); }

full_string
	= str:[^{}\n]+ { return str.join(""); }
_
    = w:[ \t\n\r]+ 
	
single_line_comment
	=  "*" [^\r\n]*