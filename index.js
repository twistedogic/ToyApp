var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    Table = require('cli-table');
    
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
                    var text = $(this).text().replace(/(\r\n|\n|\r)/gm,""); 
                    var temp = [];
                    var img = "";
                    if ($(this).children('a').children('img').length > 0){
                        $(this).children('a').children('img').each(function(i,elem) {
                            temp[i] = $(this).attr('alt');
                            temp[i] = temp[i].split('.')[0];
                            img = img + " " + temp[i];
                        });
                        // if (img){
                        //     console.log(img);
                        // }
                    }
                    col[i] = text + img;
                })
                var content = {
                        	'MoveName' : col[0],
                        	'Data': [{
                        	    'HL' : col[1],
	                            'Damage' : col[2],
	                            // 'Stun' : col[3],
	                            // 'Gain' : col[4],
	                            'CancelAbility' : col[5],
	                            'Startup' : col[6],
	                            'Active' : col[7],
	                            'Recovery' : col[8],
	                            'OnGuard' : col[9],
	                            'OnHit' : col[10],
	                            'Notes' : col[11]
                        	}]
                    };
                data.push(content);
                //console.log(content);
            }
        }
    }
    table = new Table({ head: ["Move Name", "Chainable", "Frame trap"] });
    for (var j = 0; j < data.length; j++){
        var chain = 0;
        var trap = 0;
        if (Number(data[j].Data[0].Recovery) < Number(data[j].Data[0].OnHit)){
            var chain = 1;
        }
        if (Number(data[0].Data[0].Startup) < Number(data[j].Data[0].OnGuard)){
            var trap = 1;
        }
        table.push(
            [data[j].MoveName, chain, trap]
        );
    }

    console.log(table.toString());
    // fs.writeFile("./out.json", JSON.stringify(data), function(err) {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         console.log("The file was saved!");
    //     }
    // }); 
})