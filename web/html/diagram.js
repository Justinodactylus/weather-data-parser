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
              var rMin = new Date(dateMin.getFullYear(), dateMin.getMonth(),dateMin.getDate() + 1); // Min Date = Selected + 1d
            //   var rMax = new Date(dateMin.getFullYear(), dateMin.getMonth(),dateMin.getDate() + 31); // Max Date = Selected + 31d
              $('#to').datepicker("option","minDate",rMin);
              $('#to').datepicker("option","maxDate");                    
            }

        }
    });
});

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


document.getElementById("create_button").addEventListener("click", set_user_date);

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

var checkbox_behind_the_scenes_data = [
"Max_Air_Temperature", "Min_Air_Temperature", 
"Max_Infrared_Temperature", "Min_Infrared_Temperature",
"Max_Solar_Radioation","Min_Solar_Radioation",
"Avg_Soil_Moisture_10_cm_below", "Avg_Soil_Moisture_20_cm_below", "Avg_Soil_Moisture_50_cm_below", "Avg_Soil_Moisture_100_cm_below",
"Avg_Soil_Temperature_10_cm", "Avg_Soil_Temperature_20_cm", "Avg_Soil_Temperature_50_cm", "Avg_Soil_Temperature_100_cm"];

var checkbox_temperature = false;
var checkbox_preciputation = false;

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

//Standart Values
var intervall = "hourly"
var year = "2022"
var location_vector = "3_S"

const delay = async (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

async function set_user_date(){
    start_spinner();

    dates = [];

    date = document.getElementById("jesus").value;
    var date_name = date;
    
    var input_start_date = document.getElementById("from").value;
    var input_end_date = document.getElementById("to").value;
    var start_date = new Date(input_start_date);
    var end_date = new Date(input_end_date);

    // wenn ready rein damit
    var time_options = ["UTC_Time", "UTC_Date"];
    var time_setter = 0;

    var intervall = document.getElementById("Intervall").value
    if(intervall == "option1"){
        intervall = "hourly";
    } else if (intervall == "option2"){
        intervall = "daily";
        time_setter = 1;
    }else {
        intervall = "monthly";
        time_setter = 1;
    }

    // evt.anpassung von Namen -> Vector
    var location_vector = document.getElementById("place").value

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

    if (date.length > 0 ) {
        date = date.replaceAll("/", "")
        dates.push(date);    
    }

    var year = date.slice(0, 4);
    console.log("year : " + year);

    console.log("dates[0]: " + dates[0]);
    console.log("dates[dates.length]: " + dates[dates.length-1]);

    var different_years = []
    if(dates.length > 0){
        different_years = how_many_years(dates[0],dates[dates.length-1]);
    }else if (date.length > 0){
        different_years.push(year);
    }else{
        console.log("Es wurde keine Datumseingabe getätigt");
    }


    if(time_setter == 1){
        for(var t = 0; t < dates.length; t++){
            var snipped_date = dates[t];
            dates[t] = snipped_date.slice(0, 6);
        }
    }

    var get_search_will = get_checkbox_search();

    var dataPoints = [];
    var dataPoints_max_temp = [];
    var dataPoints_min_temp = [];
    var soil_1 = [];
    var soil_2 = [];
    
    console.log("time_options[time_setter]:" + time_options[time_setter]);

    // Mögliche Fehlermeldung: siehe nach wenn Justin den code gefixt
    var selfmade_url = []
    for(var m = 0; m <= different_years.length-1; m++){
        year = different_years[m];
        var bruh = "https://backend.xml.kreller.dev/"+intervall+"/" + year + "/"+ location_vector + "/";
        selfmade_url.push(bruh);
        console.log("selfmade_url in der for schleife:" + selfmade_url[m]);
        console.log("selfmade_url.length:" + selfmade_url.length);
    }
        for (var d = 0; d < selfmade_url.length; d++){
            console.log("selfmade_url[d]: " + selfmade_url[d]);
            await delay(7000);

            $.get(selfmade_url[d], function(weather_data) {
                for(var i = 0; i < dates.length; i++) {
                    $(weather_data).find("UTC_Date").filter(":contains(" + dates[i] + ")").each(function () {
                        
                        var $dataPoint = $(this);
                        var x = $dataPoint.find(time_options[time_setter]).clone().children().remove().end().text();
                        var y = $dataPoint.find(get_search_will[0]).clone().children().remove().end().text();
                        
                        if (y <= -99.000){
                            y = "";
                        }

                        dataPoints.push({label: x, y: parseFloat(y)});


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
            
                var graph_title = "";
                if (date.length > 0) {
                    graph_title = date_name + ": " + get_search_will[1];
                } else if (input_start_date.length > 0 && input_end_date.length > 0){
                    graph_title = input_start_date + " - " + input_end_date + ": " + get_search_will[1];
                } else {
                    graph_title = "Es wurde kein Datum angegeben"
                }

                stop_spinner();
                var chart = new CanvasJS.Chart("chartContainer", {
                    title: {
                        text: graph_title,
                    },
                    data: [
                        {
                            type: "spline",
                            dataPoints: soil_2,
                            color: "green"
                        },
                        {
                            type: "spline",
                            dataPoints: soil_1,
                            color: "green"
                        },
                        {
                            type:"spline",
                            dataPoints: dataPoints_max_temp,
                            color: "red"
                        },
                        {
                            type:"spline",
                            dataPoints: dataPoints_min_temp,
                            color: "blue"
                        },
                        {
                            type: "spline",
                            dataPoints: dataPoints,
                            color: "green"
                        }
                    ]
                });
                chart.render();
            });
        }
        // $("input[type='text']").val("");
     
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


  


// document.getElementById("jesus").addEventListener("click", function() {
//     document.getElementById("from").value = "";
//     document.getElementById("to").value = "";
//   });

//   document.getElementById("from").addEventListener("click", function() {
//     document.getElementById("to").value = "";
//   });