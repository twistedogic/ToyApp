var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio');
    
request('http://wiki.shoryuken.com/Super_Street_Fighter_IV_AE/Yang', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        $ = cheerio.load(body);
        var table = $('table[cellspacing="0"]').html();
        //console.log(table);
        var row = []
        $ = cheerio.load(table);
        $('tr').each(function(i, elem) {
            row[i] = $(this).html();
        });
        var data = [];
        for (var i = 2; i<row.length; i++){
            $ = cheerio.load(row[i]);
            var check = $('td').length;
            var col = [];
            if (check > 0){
                $('td').each(function(i, elem) {
                    col[i] = $(this).text().replace(/(\r\n|\n|\r)/gm,"");
                })
                var content = {
                        	'Move Name' : col[0],
	                        'HL' : col[1],
	                       // 'Damage' : col[2],
	                       // 'Stun' : col[3],
	                       // 'Gain' : col[4],
	                        'Cancel Ability' : col[5],
	                        'Startup' : col[6],
	                        'Active' : col[7],
	                        'Recovery' : col[8],
	                        'On Guard' : col[9],
	                        'On Hit' : col[10]
	                       // 'Notes' : col[11]
                    };
                data.push(JSON.stringify(content));
            }
        }
    }
    fs.writeFile("./out", data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    }); 
})