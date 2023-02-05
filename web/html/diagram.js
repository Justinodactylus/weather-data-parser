//erkennt die Eingabe im Datum / Datums Intervall eingaben
$(function() {
    $( "#jesus" ).datepicker({
        dateFormat : "yy/mm/dd"
    });
    $( "#from, #to").datepicker({
        dateFormat : "yy/mm/dd",
        changeMonth: true,
        onSelect: function( selectedDate ) {
            if(this.id == 'from'){
              var dateMin = $('#from').datepicker("getDate");
              var rMin = new Date(dateMin.getFullYear(), dateMin.getMonth(),dateMin.getDate() + 1);
              $('#to').datepicker("option","minDate",rMin);
              $('#to').datepicker("option","maxDate");                    
            }

        }
    });
});

//Erstellt Wartezeichen-Komponenten
var opts = {
    lines: 12, // The number of lines to draw
    length: 7, // The length of each line
    width: 5, // The line thickness
    radius: 10, // The radius of the inner circle
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 100, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
};
var target = document.getElementById('loading');
var spinner;

function start_spinner(){
    spinner = new Spinner(opts).spin(target);
}

function stop_spinner(){
    spinner.stop();
}

//Startet das generieren des Graphen
document.getElementById("create_button").addEventListener("click", set_user_date);

//Checkbox, "Großthema", "Menschliche" beschreibung des Großthemas (wird als Title genutzt)
var checkbox_options = [
    ["#checkbox_temperature", "Avg_Air_Temperature", "Temperatur"],
    ["#checkbox_temperature_5min", "Avg_Air_Temperature_Last_5_Min","Temperatur letzter 5 min" ],
    ["#checkbox_precipitation", "Precipitation", "Niederschlag"],
    ["#checkbox_infrared", "Avg_Infrared_Temperature", "Infarot Temperatur"],
    ["#checkbox_solar_radiation", "Avg_Solar_Radioation", "Durchschnittliche Sonneneinstrahlung"],
    ["#checkbox_rh", "Avg_RH", "RH"],
    ["#checkbox_soil_moisture", "Avg_Soil_Moisture_5_cm_below", "Bodenfeuchtigkeit"],
    ["#checkbox_soil_temperature", "Avg_Soil_Temperature_5_cm", "Bodentemperatur"]
]

//Zusatzinformationen für jede "Großoption"
var checkbox_behind_the_scenes_data = [
"Max_Air_Temperature", "Min_Air_Temperature", 
"Max_Infrared_Temperature", "Min_Infrared_Temperature",
"Max_Solar_Radioation","Min_Solar_Radioation",
"Avg_Soil_Moisture_10_cm_below", "Avg_Soil_Moisture_20_cm_below", "Avg_Soil_Moisture_50_cm_below", "Avg_Soil_Moisture_100_cm_below",
"Avg_Soil_Temperature_10_cm", "Avg_Soil_Temperature_20_cm", "Avg_Soil_Temperature_50_cm", "Avg_Soil_Temperature_100_cm"];

var checkbox_temperature = false;
var checkbox_preciputation = false;

//aktiviert, was im Diagram angezeigt wird (max, min, avg,...), je nach dem was in der Checkbox angeklickt wurde
function get_checkbox_search(){
    var weitergabe = [];

    for (var i = 0; i < checkbox_options.length; i++){
        if($(checkbox_options[i][0]).is(":checked")){
            console.log("checkbox for : " + checkbox_options[i][0]);
            weitergabe.push(checkbox_options[i][1]);
            weitergabe.push(checkbox_options[i][2]);

            //Übergibt den spezifischen Kategorien seine Unterkategorien
            if (checkbox_options[i][1] == "Avg_Air_Temperature") {
                weitergabe.push(checkbox_behind_the_scenes_data[0]);
                weitergabe.push(checkbox_behind_the_scenes_data[1]);
            } else if (checkbox_options[i][1] == "Avg_Infrared_Temperature") {
                weitergabe.push(checkbox_behind_the_scenes_data[2]);
                weitergabe.push(checkbox_behind_the_scenes_data[3]);                
            } else if (checkbox_options[i][1] == "Avg_Solar_Radioation"){
                weitergabe.push(checkbox_behind_the_scenes_data[4]);
                weitergabe.push(checkbox_behind_the_scenes_data[5]);
            }else if (checkbox_options[i][1] == "Avg_Soil_Moisture_5_cm_below") {
                weitergabe.push(checkbox_behind_the_scenes_data[6]);
                weitergabe.push(checkbox_behind_the_scenes_data[7]);  
                weitergabe.push(checkbox_behind_the_scenes_data[8]);
                weitergabe.push(checkbox_behind_the_scenes_data[9]);              
            }else if (checkbox_options[i][1] == "Avg_Soil_Temperature_5_cm") {
                weitergabe.push(checkbox_behind_the_scenes_data[10]);
                weitergabe.push(checkbox_behind_the_scenes_data[11]); 
                weitergabe.push(checkbox_behind_the_scenes_data[12]);
                weitergabe.push(checkbox_behind_the_scenes_data[13]);               
            }
        }
    }

    return weitergabe;
}

//Gibt Array wieder, in welcher start und endjahr steht
function how_many_years(start_date, end_date){
    var array_of_years = [];
    var start_year = parseInt(start_date.slice(0,4));
    var end_year = parseInt(end_date.slice(0,4));

    console.log("start_year: " + start_year);
    console.log("end_year: " + end_year);

    while(start_year <= end_year){
        array_of_years.push(start_year);
        start_year++;
    }
    return array_of_years;

}

var date = "";
var dates = [];

var locations = [
    ["place0", "1_NNE"],
    ["place1", "87_WNW"],
    ["place2", "14_ESE"],
    ["place3", "3_S"],
    ["place4", "27_N"],
    ["place5", "11_NE"],
    ["place6", "64_N"],
    ["place7", "2_NE"],
    ["place8", "1_NNE"],
    ["place9", "29_ENE"],
    ["place10", "42_SE"],
    ["place11", "6_S"],
    ["place12", "1_SW"],
    ["place13", "3_SSW"],
    ["place14", "44_ESE"],
    ["place15", "1_ENE"],
    ["place16", "28_E"],
    ["place17", "1_NE"],
    ["place18", "4_NE"],
    ["place19", "70_SE"],
    ["place20", "5_ENE"],
    ["place21", "4_ENE"],
    ["place22", "3_SSE"],
    ["place23", "3_NNE"],
    ["place24", "2_NE"],
    ["place25", "2_WSW"],
    ["place26", "3_ENE"],
    ["place27", "3_NE"],
    ["place28", "19_N"],
    ["place29", "2_NE"],
    ["place30", "2_WNW"],
    ["place31", "2_S"],
    ["place32", "2_N"],
    ["place33", "2_S"],
    ["place34", "4_SSE"],
    ["place35", "2_NE"],
    ["place36", "6_SSE"],
    ["place37", "13_WNW"],
    ["place38", "10_NNE"],
    ["place39", "2_S"],
    ["place40", "2_W"],
    ["place41", "1_SSW"],
    ["place42", "8_WNW"],
    ["place43", "5_S"],
    ["place44", "11_W"],
    ["place45", "35_NNW"],
    ["place46", "27_ENE"],
    ["place47", "6_WSW"],
    ["place48", "5_NE"],
    ["place49", "23_WSW"],
    ["place50", "12_WNW"],
    ["place51", "11_W"],
    ["place52", "1_SW"],
    ["place53", "12_W"],
    ["place54", "14_W"],
    ["place55", "8_SE"],
    ["place56", "2_E"],
    ["place57", "17_WSW"],
    ["place58", "11_ENE"],
    ["place59", "7_NNE"],
    ["place60", "5_NE"],
    ["place61", "23_SSE"],
    ["place62", "7_E"],
    ["place63", "23_S"],
    ["place64", "8_W"],
    ["place65", "11_SW"],
    ["place66", "5_SSE"],
    ["place67", "5_S"],
    ["place68", "5_NNE"],
    ["place69", "17_E"],
    ["place70", "17_SW"],
    ["place71", "10_W"],
    ["place72", "9_SW"],
    ["place73", "5_NNE"],
    ["place74", "5_WNW"],
    ["place75", "6_SSW"],
    ["place76", "19_SSW"],
    ["place77", "21_NNE"],
    ["place78", "3_NNW"],
    ["place79", "13_SE"],
    ["place80", "26_N"],
    ["place81", "4_NNW"],
    ["place82", "2_W"],
    ["place83", "1_SE"],
    ["place84", "9_SSW"],
    ["place85", "12_NNW"],
    ["place86", "6_W"],
    ["place87", "22_ENE"],
    ["place88", "24_N"],
    ["place89", "10_W"],
    ["place90", "4_N"],
    ["place91", "5_ENE"],
    ["place92", "18_WSW"],
    ["place93", "42_WSW"],
    ["place94", "1_SSW"],
    ["place95", "29_ENE"],
    ["place96", "34_NE"],
    ["place97", "8_SSW"],
    ["place98", "13_S"],
    ["place99", "11_W"],
    ["place100", "38_WSW"],
    ["place101", "7_E"],
    ["place102", "5_ESE"],
    ["place103", "20_SSE"],
    ["place104", "8_ENE"],
    ["place105", "11_SW"],
    ["place106", "5_ENE"],
    ["place107", "2_N"],
    ["place108", "2_SSW"],
    ["place109", "20_N"],
    ["place110", "13_W"],
    ["place111", "20_N"],
    ["place112", "5_W"],
    ["place113", "52_WSW"],
    ["place114", "3_SSW"],
    ["place115", "13_E"],
    ["place116", "3_W"],
    ["place117", "3_SSE"],
    ["place118", "2_E"],
    ["place119", "2_SE"],
    ["place120", "2_W"],
    ["place121", "5_WNW"],
    ["place122", "1_W"],
    ["place123", "8_SW"],
    ["place124", "10_SSW"],
    ["place125", "35_WNW"],
    ["place126", "10_WSW"],
    ["place127", "2_N"],
    ["place128", "1_NW"],
    ["place129", "1_W"],
    ["place130", "3_W"],
    ["place131", "7_NE"],
    ["place132", "35_WNW"],
    ["place133", "13_ESE"],
    ["place134", "24_S"],
    ["place135", "14_NNE"],
    ["place136", "7_NW"],
    ["place137", "33_NW"],
    ["place138", "11_NNE"],
    ["place139", "17_NNE"],
    ["place140", "6_ENE"],
    ["place141", "19_S"],
    ["place142", "6_WNW"],
    ["place143", "2_N"],
    ["place144", "32_NNE"],
    ["place145", "28_WNW"],
    ["place146", "7_E"],
    ["place147", "5_ENE"],
    ["place148", "2_SSE"],
    ["place149", "21_NNE"],
    ["place150", "4_NE"],
    ["place151", "17_SSW"],
    ["place152", "5_WNW"],
    ["place153", "21_ENE"],
    ["place154", "11_SSE"],
    ["place155", "1_NNE"],
    ["place156", "8_NNW"]
]


//Bekommt Place von Dings
function get_place(){
    var places = document.getElementById("Places").value
    var place;
    for(var i = 0; i < locations.length; i++){
        console.log("locations[i][0] : " + locations[i][0]);
        if(places == locations[i][0]){
            console.log("wurde gechacked");
            place = locations[i][1];
            break;
        }
    }
    return place
}

//Standart Values
var intervall = "hourly"
var year = "2022"
var location_vector = "3_S"

const delay = async (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

async function set_user_date(){
    start_spinner();

    dates = [];

    //Einzelnes Datum (kein Intervall)
    date = document.getElementById("jesus").value;
    var date_name = date;
    
    var input_start_date = document.getElementById("from").value;
    var input_end_date = document.getElementById("to").value;
    var start_date = new Date(input_start_date);
    var end_date = new Date(input_end_date);

    var time_options = ["UTC_Time", "UTC_Date"];
    var time_setter = 0;
    var O_daily_l_monthly;

    //Gibt an, wie das Intervall dargestellt werden soll
    var intervall = document.getElementById("Intervall").value
    if(intervall == "option1"){
        intervall = "hourly";
    } else if (intervall == "option2"){
        intervall = "daily";
        time_setter = 1;
        O_daily_l_monthly = 0;
    }else {
        intervall = "monthly";
        time_setter = 1;
        O_daily_l_monthly = 1;
    }

    // evt.anpassung von Namen -> Vector
    var location_vector = get_place();

    //Übergibt die Dates von bis einzeln (z.B.: 20220101, 20220102, ...)
    for (var current_date = start_date; current_date <= end_date; current_date.setDate((current_date.getDate() + 1) ) ){
        console.log("current_date Day : " + current_date.getDate());
        console.log("current_date Month : " + (current_date.getMonth() + 1)); 
        console.log("current_date Year : " + current_date.getFullYear());

        var current_day_date = current_date.getDate();
        var current_month_date = current_date.getMonth() + 1;
        var current_year_date = current_date.getFullYear();

        var str_current_day_date = "";
        var str_current_month_date = "";
        var str_current_year_date = "";


        if(current_day_date <= 9){
            str_current_day_date = current_day_date.toString();
            str_current_day_date = "0" + str_current_day_date;
        }else{
            str_current_day_date = current_day_date.toString();
        }
        if (current_month_date <= 9) {
            str_current_month_date = current_month_date.toString();
            str_current_month_date = "0" + str_current_month_date;
        } else {
            str_current_month_date = current_month_date.toString();
        }
        str_current_year_date = current_year_date.toString();

        var editet_date = str_current_year_date + str_current_month_date + str_current_day_date;
        console.log("Output of range Date : " + editet_date);
        dates.push(editet_date);
    }

    console.log("set_user_date: : " + date);

    //Macht unser Datum lesbar für die Funktion
    if (date.length > 0 ) {
        date = date.replaceAll("/", "")
        dates.push(date);    
    }

    var year = date.slice(0, 4);
    console.log("year : " + year);

    console.log("dates[0]: " + dates[0]);
    console.log("dates[dates.length]: " + dates[dates.length-1]);

    var different_years = []

    //fügt Datum/-s in different_years ein
    if(dates.length > 0){
        different_years = how_many_years(dates[0],dates[dates.length-1]);
    }else if (date.length > 0){
        different_years.push(year);
    }else{
        console.log("Es wurde keine Datumseingabe getätigt");
    }

    //passt dates Format an, wenn daily oder monthly ausgewählt wird
    if(time_setter == 1 && O_daily_l_monthly == 1){
        for(var t = 0; t < dates.length; t++){
            var snipped_date = dates[t];
            dates[t] = snipped_date.slice(0, 6);
        }
    }

    //ausgewählte Checkbox wird übereben 
    var get_search_will = get_checkbox_search();

    var dataPoints = [];
    var dataPoints_max_temp = [];
    var dataPoints_min_temp = [];
    var soil_1 = [];
    var soil_2 = [];
    
    console.log("time_options[time_setter]:" + time_options[time_setter]);

    var selfmade_url = []
    //Erstellt die Links, wenn mehr als ein Jahr Intervall gewählt wurde 
    for(var m = 0; m <= different_years.length-1; m++){
        year = different_years[m];
        var bruh = "https://backend.xml.kreller.dev/"+intervall+"/" + year + "/"+ location_vector + "/";
        selfmade_url.push(bruh);
        console.log("selfmade_url in der for schleife:" + selfmade_url[m]);
        console.log("selfmade_url.length:" + selfmade_url.length);
    }
        // erstellt Dealy für richtige Graphendarstellung bei mehreren Jahren
        for (var d = 0; d < selfmade_url.length; d++){
            console.log("selfmade_url[d]: " + selfmade_url[d]);
            if(time_setter == 0 || O_daily_l_monthly == 0){
                await delay(7000); // nur bei meheren Jahren aktiviert -> Graph von 20xx+1 wird damit langsamer geladen als 20xx -> richtige anreihung der Daten
            }
            //Lädt daten aus dem Link herunter
            $.get(selfmade_url[d], function(weather_data) {
                for(var i = 0; i < dates.length; i++) {
                    $(weather_data).find("UTC_Date").filter(":contains(" + dates[i] + ")").each(function () { // schaut nach UTC_Date und gibt dementsprechend Daten davon aus
                        var x;
                        var $dataPoint = $(this);
                        if(time_setter == 1){
                            x = $dataPoint.clone().children().remove().end().text(); // .clone().children().remove().end().text(); muss gesetzt werden, weil sonst alle Child Componenten mit im Graphen in der x Achse mit reingeschrieben -> unübersichtlich und nicht richtig dargestellt
                        }else{
                            x = $dataPoint.find(time_options[time_setter]).clone().children().remove().end().text();
                        }
                        
                        var y = $dataPoint.find(get_search_will[0]).clone().children().remove().end().text();
                        
                        console.log("Ausgabe von x:" + x);

                        //-99.000 => Wert nicht vorhanden -> wird "entleert"
                        if (y <= -99.000){
                            y = "";
                        }

                        //gibt die Datenpunkte in dataPoints -> Punkte werden gespeichert und können im Graphen dargestellt werden
                        dataPoints.push({label: x, y: parseFloat(y)});

                        //Verschiedene Darstellung, je nachdem was in der Checkbox angeklickt wurde
                        if(get_search_will[0] == "Avg_Air_Temperature" || get_search_will[0] == "Avg_Infrared_Temperature" || get_search_will[0] == "Avg_Solar_Radioation"){
                            var $dataPoints_max_temp = $(this);
                            var x_max = $dataPoints_max_temp.find(time_options[time_setter]).clone().children().remove().end().text();
                            var y_max = $dataPoints_max_temp.find(get_search_will[2]).clone().children().remove().end().text();

                            var $dataPoints_min_temp = $(this);
                            var x_min = $dataPoints_min_temp.find(time_options[time_setter]).clone().children().remove().end().text();
                            var y_min = $dataPoints_min_temp.find(get_search_will[3]).clone().children().remove().end().text();
                            if (y_max <= -99.000){
                                y_max = "";
                            }
                            if (y_min <= -99.000){
                                y_min = "";
                            }
                            
                            dataPoints_max_temp.push({label: x_max, y: parseFloat(y_max)});
                            
                            dataPoints_min_temp.push({label: x_min, y: parseFloat(y_min)});
                        }

                        if(get_search_will[0] == "Avg_Soil_Moisture_5_cm_below" || get_search_will[0] == "Avg_Soil_Temperature_5_cm"){
                            var $dataPoints_max_temp = $(this);
                            var x_10 = $dataPoints_max_temp.find(time_options[time_setter]).clone().children().remove().end().text();
                            var y_10 = $dataPoints_max_temp.find(get_search_will[2]).clone().children().remove().end().text();

                            var $dataPoints_min_temp = $(this);
                            var x_20 = $dataPoints_min_temp.find(time_options[time_setter]).clone().children().remove().end().text();
                            var y_20 = $dataPoints_min_temp.find(get_search_will[3]).clone().children().remove().end().text();

                            var $soil_1 = $(this);
                            var x_50 = $soil_1.find(time_options[time_setter]).clone().children().remove().end().text();
                            var y_50 = $soil_1.find(get_search_will[4]).clone().children().remove().end().text();

                            var $soil_2 = $(this);
                            var x_100 = $soil_2.find(time_options[time_setter]).clone().children().remove().end().text();
                            var y_100 = $soil_2.find(get_search_will[5]).clone().children().remove().end().text();


                            if (y_10 <= -99.000){
                                y_10 = "";
                            }
                            if (y_20 <= -99.000){
                                y_20 = "";
                            }
                            if (y_50 <= -99.000){
                                y_50 = "";
                            }
                            if (y_100 <= -99.000){
                                y_100 = "";
                            }
                            
                            
                            dataPoints_max_temp.push({label: x_10, y: parseFloat(y_10)}); 
                            dataPoints_min_temp.push({label: x_20, y: parseFloat(y_20)});
                            soil_1.push({label: x_50, y: parseFloat(y_50)});
                            soil_2.push({label: x_100, y: parseFloat(y_100)});
                        }
                        

                    });
                }

                // Title wird hier generiert/ gesetzt
                var graph_title = "";
                if (date.length > 0) {
                    graph_title = date_name + ": " + get_search_will[1];
                } else if (input_start_date.length > 0 && input_end_date.length > 0){
                    graph_title = input_start_date + " - " + input_end_date + ": " + get_search_will[1];
                } else {
                    graph_title = "Es wurde kein Datum angegeben"
                }

                //gibt Graph darstellung an | Niederschlag -> Balkendiagramm, sonst Temperatur-Diagramm Design
                var graph_type = "spline";
                if(get_search_will[0] == "Precipitation"){
                    graph_type = "column";
                }

                stop_spinner();
                //Erstellt den Graphen anhand unserer Daten
                var chart = new CanvasJS.Chart("chartContainer", {
                    title: {
                        text: graph_title,
                    },
                    data: [ // Sollte ein dataPoints angegebenes Array leer sein, wird dieses nicht angezeigt -> keine Seperate anpassung der jeweiligen Checkboxen nötig
                        {
                            type: graph_type,
                            dataPoints: soil_2,
                            color: "black"
                        },
                        {
                            type: graph_type,
                            dataPoints: soil_1,
                            color: "yellow"
                        },
                        {
                            type:graph_type,
                            dataPoints: dataPoints_max_temp,
                            color: "red"
                        },
                        {
                            type:graph_type,
                            dataPoints: dataPoints_min_temp,
                            color: "blue"
                        },
                        {
                            type: graph_type,
                            dataPoints: dataPoints,
                            color: "green"
                        }
                    ]
                });
                chart.render();
            });
            if(time_setter == 1 && O_daily_l_monthly == 1){
                d = selfmade_url.length+1;
            }
        }    
}

function myLoop(i) {         //  create a loop function
    setTimeout(function() {   //  call a 3s setTimeout when the loop is called
      console.log('hello');   //  your code here
      i++;                    //  increment the counter
      if (i < 10) {           //  if the counter < 10, call the loop function
        myLoop();             //  ..  again which will trigger another 
      }                       //  ..  setTimeout()
    }, 3000)
  }