﻿window.enlargeImages = function () {
    $('img[data-enlargeable]').addClass('img-enlargeable').click(function () {
        var src = $(this).attr('src');
        var modal;

        function removeModal() {
            modal.remove();
            $('body').off('keyup.modal-close');
        }
        modal = $('<div>').css({
            background: 'RGBA(0,0,0,.5) url(' + src + ') no-repeat center',
            backgroundSize: 'contain',
            width: '100%',
            height: '100%',
            position: 'fixed',
            zIndex: '10000',
            top: '0',
            left: '0',
            cursor: 'zoom-out'
        }).click(function () {
            removeModal();
        }).appendTo('body');
        //handling ESC
        $('body').on('keyup.modal-close', function (e) {
            if (e.key === 'Escape') {
                removeModal();
            }
        });
    });
}


window.typedEffect = function () {
    var typed = new Typed('#element', {
        strings: ['Welcam', 'Wel', 'Welcome!'],
        typeSpeed: 100,
        backSpeed: 100,
        loop: false
    });
}

// Making Drill Map.
//function GenerateMap() {
window.GenerateMap = function () {

    var continents = {
        "AF": 0,
        "AN": 1,
        "AS": 2,
        "EU": 3,
        "NA": 4,
        "OC": 5,
        "SA": 6
    }

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("mapdiv");
    var colors = am5.ColorSet.new(root, {});


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
        am5themes_Animated.new(root)
    ]);


    // Create the map chart
    // https://www.amcharts.com/docs/v5/charts/map-chart/
    var chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: am5map.geoMercator()
    }));


    // Create polygon series for the world map
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    var worldSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"]
    }));

    worldSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        fill: am5.color(0xaaaaaa),
        templateField: "polygonSettings"
    });

    worldSeries.mapPolygons.template.states.create("hover", {
        fill: colors.getIndex(9)
    });

    worldSeries.mapPolygons.template.events.on("click", (ev) => {
        var dataItem = ev.target.dataItem;
        var data = dataItem.dataContext;
        var zoomAnimation = worldSeries.zoomToDataItem(dataItem);

        Promise.all([
            zoomAnimation.waitForStop(),
            am5.net.load("https://cdn.amcharts.com/lib/5/geodata/json/" + data.map + ".json", chart)
        ]).then((results) => {
            var geodata = am5.JSONParser.parse(results[1].response);
            countrySeries.setAll({
                geoJSON: geodata,
                fill: data.polygonSettings.fill
            });

            countrySeries.show();
            worldSeries.hide(100);
            backContainer.show();
        });
    });

    // Create polygon series for the country map
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    var countrySeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        visible: false
    }));

    countrySeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        fill: am5.color(0xaaaaaa)
    });

    countrySeries.mapPolygons.template.states.create("hover", {
        fill: colors.getIndex(9)
    });


    // Set up data for countries
    var data = [];
    for (var id in am5geodata_data_countries2) {
        if (am5geodata_data_countries2.hasOwnProperty(id)) {
            var country = am5geodata_data_countries2[id];
            if (country.maps.length) {
                data.push({
                    id: id,
                    map: country.maps[0],
                    polygonSettings: {
                        fill: colors.getIndex(continents[country.continent_code]),
                    }
                });
            }
        }
    }
    worldSeries.data.setAll(data);


    // Add button to go back to continents view
    var backContainer = chart.children.push(am5.Container.new(root, {
        x: am5.p100,
        centerX: am5.p100,
        dx: -10,
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        y: 30,
        interactiveChildren: false,
        layout: root.horizontalLayout,
        cursorOverStyle: "pointer",
        background: am5.RoundedRectangle.new(root, {
            fill: am5.color(0xffffff),
            fillOpacity: 0.2
        }),
        visible: false
    }));

    var backLabel = backContainer.children.push(am5.Label.new(root, {
        text: "Back to world map",
        centerY: am5.p50
    }));

    var backButton = backContainer.children.push(am5.Graphics.new(root, {
        width: 32,
        height: 32,
        centerY: am5.p50,
        fill: am5.color(0x555555),
        svgPath: "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM27.436,17.39c0.001,0.002,0.004,0.002,0.005,0.004c-0.022,0.187-0.054,0.37-0.085,0.554c-0.015-0.012-0.034-0.025-0.047-0.036c-0.103-0.09-0.254-0.128-0.318-0.115c-0.157,0.032,0.229,0.305,0.267,0.342c0.009,0.009,0.031,0.03,0.062,0.058c-1.029,5.312-5.709,9.338-11.319,9.338c-4.123,0-7.736-2.18-9.776-5.441c0.123-0.016,0.24-0.016,0.28-0.076c0.051-0.077,0.102-0.241,0.178-0.331c0.077-0.089,0.165-0.229,0.127-0.292c-0.039-0.064,0.101-0.344,0.088-0.419c-0.013-0.076-0.127-0.256,0.064-0.407s0.394-0.382,0.407-0.444c0.012-0.063,0.166-0.331,0.152-0.458c-0.012-0.127-0.152-0.28-0.24-0.318c-0.09-0.037-0.28-0.05-0.356-0.151c-0.077-0.103-0.292-0.203-0.368-0.178c-0.076,0.025-0.204,0.05-0.305-0.015c-0.102-0.062-0.267-0.139-0.33-0.189c-0.065-0.05-0.229-0.088-0.305-0.088c-0.077,0-0.065-0.052-0.178,0.101c-0.114,0.153,0,0.204-0.204,0.177c-0.204-0.023,0.025-0.036,0.141-0.189c0.113-0.152-0.013-0.242-0.141-0.203c-0.126,0.038-0.038,0.115-0.241,0.153c-0.203,0.036-0.203-0.09-0.076-0.115s0.355-0.139,0.355-0.19c0-0.051-0.025-0.191-0.127-0.191s-0.077-0.126-0.229-0.291c-0.092-0.101-0.196-0.164-0.299-0.204c-0.09-0.579-0.15-1.167-0.15-1.771c0-2.844,1.039-5.446,2.751-7.458c0.024-0.02,0.048-0.034,0.069-0.036c0.084-0.009,0.31-0.025,0.51-0.059c0.202-0.034,0.418-0.161,0.489-0.153c0.069,0.008,0.241,0.008,0.186-0.042C8.417,8.2,8.339,8.082,8.223,8.082S8.215,7.896,8.246,7.896c0.03,0,0.186,0.025,0.178,0.11C8.417,8.091,8.471,8.2,8.625,8.167c0.156-0.034,0.132-0.162,0.102-0.195C8.695,7.938,8.672,7.853,8.642,7.794c-0.031-0.06-0.023-0.136,0.14-0.153C8.944,7.625,9.168,7.708,9.16,7.573s0-0.28,0.046-0.356C9.253,7.142,9.354,7.09,9.299,7.065C9.246,7.04,9.176,7.099,9.121,6.972c-0.054-0.127,0.047-0.22,0.108-0.271c0.02-0.015,0.067-0.06,0.124-0.112C11.234,5.257,13.524,4.466,16,4.466c3.213,0,6.122,1.323,8.214,3.45c-0.008,0.022-0.01,0.052-0.031,0.056c-0.077,0.013-0.166,0.063-0.179-0.051c-0.013-0.114-0.013-0.331-0.102-0.203c-0.089,0.127-0.127,0.127-0.127,0.191c0,0.063,0.076,0.127,0.051,0.241C23.8,8.264,23.8,8.341,23.84,8.341c0.036,0,0.126-0.115,0.239-0.141c0.116-0.025,0.319-0.088,0.332,0.026c0.013,0.115,0.139,0.152,0.013,0.203c-0.128,0.051-0.267,0.026-0.293-0.051c-0.025-0.077-0.114-0.077-0.203-0.013c-0.088,0.063-0.279,0.292-0.279,0.292s-0.306,0.139-0.343,0.114c-0.04-0.025,0.101-0.165,0.203-0.228c0.102-0.064,0.178-0.204,0.14-0.242c-0.038-0.038-0.088-0.279-0.063-0.343c0.025-0.063,0.139-0.152,0.013-0.216c-0.127-0.063-0.217-0.14-0.318-0.178s-0.216,0.152-0.305,0.204c-0.089,0.051-0.076,0.114-0.191,0.127c-0.114,0.013-0.189,0.165,0,0.254c0.191,0.089,0.255,0.152,0.204,0.204c-0.051,0.051-0.267-0.025-0.267-0.025s-0.165-0.076-0.268-0.076c-0.101,0-0.229-0.063-0.33-0.076c-0.102-0.013-0.306-0.013-0.355,0.038c-0.051,0.051-0.179,0.203-0.28,0.152c-0.101-0.051-0.101-0.102-0.241-0.051c-0.14,0.051-0.279-0.038-0.355,0.038c-0.077,0.076-0.013,0.076-0.255,0c-0.241-0.076-0.189,0.051-0.419,0.089s-0.368-0.038-0.432,0.038c-0.064,0.077-0.153,0.217-0.19,0.127c-0.038-0.088,0.126-0.241,0.062-0.292c-0.062-0.051-0.33-0.025-0.367,0.013c-0.039,0.038-0.014,0.178,0.011,0.229c0.026,0.05,0.064,0.254-0.011,0.216c-0.077-0.038-0.064-0.166-0.141-0.152c-0.076,0.013-0.165,0.051-0.203,0.077c-0.038,0.025-0.191,0.025-0.229,0.076c-0.037,0.051,0.014,0.191-0.051,0.203c-0.063,0.013-0.114,0.064-0.254-0.025c-0.14-0.089-0.14-0.038-0.178-0.012c-0.038,0.025-0.216,0.127-0.229,0.012c-0.013-0.114,0.025-0.152-0.089-0.229c-0.115-0.076-0.026-0.076,0.127-0.025c0.152,0.05,0.343,0.075,0.622-0.013c0.28-0.089,0.395-0.127,0.28-0.178c-0.115-0.05-0.229-0.101-0.406-0.127c-0.179-0.025-0.42-0.025-0.7-0.127c-0.279-0.102-0.343-0.14-0.457-0.165c-0.115-0.026-0.813-0.14-1.132-0.089c-0.317,0.051-1.193,0.28-1.245,0.318s-0.128,0.19-0.292,0.318c-0.165,0.127-0.47,0.419-0.712,0.47c-0.241,0.051-0.521,0.254-0.521,0.305c0,0.051,0.101,0.242,0.076,0.28c-0.025,0.038,0.05,0.229,0.191,0.28c0.139,0.05,0.381,0.038,0.393-0.039c0.014-0.076,0.204-0.241,0.217-0.127c0.013,0.115,0.14,0.292,0.114,0.368c-0.025,0.077,0,0.153,0.09,0.14c0.088-0.012,0.559-0.114,0.559-0.114s0.153-0.064,0.127-0.166c-0.026-0.101,0.166-0.241,0.203-0.279c0.038-0.038,0.178-0.191,0.014-0.241c-0.167-0.051-0.293-0.064-0.115-0.216s0.292,0,0.521-0.229c0.229-0.229-0.051-0.292,0.191-0.305c0.241-0.013,0.496-0.025,0.444,0.051c-0.05,0.076-0.342,0.242-0.508,0.318c-0.166,0.077-0.14,0.216-0.076,0.292c0.063,0.076,0.09,0.254,0.204,0.229c0.113-0.025,0.254-0.114,0.38-0.101c0.128,0.012,0.383-0.013,0.42-0.013c0.039,0,0.216,0.178,0.114,0.203c-0.101,0.025-0.229,0.013-0.445,0.025c-0.215,0.013-0.456,0.013-0.456,0.051c0,0.039,0.292,0.127,0.19,0.191c-0.102,0.063-0.203-0.013-0.331-0.026c-0.127-0.012-0.203,0.166-0.241,0.267c-0.039,0.102,0.063,0.28-0.127,0.216c-0.191-0.063-0.331-0.063-0.381-0.038c-0.051,0.025-0.203,0.076-0.331,0.114c-0.126,0.038-0.076-0.063-0.242-0.063c-0.164,0-0.164,0-0.164,0l-0.103,0.013c0,0-0.101-0.063-0.114-0.165c-0.013-0.102,0.05-0.216-0.013-0.241c-0.064-0.026-0.292,0.012-0.33,0.088c-0.038,0.076-0.077,0.216-0.026,0.28c0.052,0.063,0.204,0.19,0.064,0.152c-0.14-0.038-0.317-0.051-0.419,0.026c-0.101,0.076-0.279,0.241-0.279,0.241s-0.318,0.025-0.318,0.102c0,0.077,0,0.178-0.114,0.191c-0.115,0.013-0.268,0.05-0.42,0.076c-0.153,0.025-0.139,0.088-0.317,0.102s-0.204,0.089-0.038,0.114c0.165,0.025,0.418,0.127,0.431,0.241c0.014,0.114-0.013,0.242-0.076,0.356c-0.043,0.079-0.305,0.026-0.458,0.026c-0.152,0-0.456-0.051-0.584,0c-0.127,0.051-0.102,0.305-0.064,0.419c0.039,0.114-0.012,0.178-0.063,0.216c-0.051,0.038-0.065,0.152,0,0.204c0.063,0.051,0.114,0.165,0.166,0.178c0.051,0.013,0.215-0.038,0.279,0.025c0.064,0.064,0.127,0.216,0.165,0.178c0.039-0.038,0.089-0.203,0.153-0.166c0.064,0.039,0.216-0.012,0.331-0.025s0.177-0.14,0.292-0.204c0.114-0.063,0.05-0.063,0.013-0.14c-0.038-0.076,0.114-0.165,0.204-0.254c0.088-0.089,0.253-0.013,0.292-0.115c0.038-0.102,0.051-0.279,0.151-0.267c0.103,0.013,0.243,0.076,0.331,0.076c0.089,0,0.279-0.14,0.332-0.165c0.05-0.025,0.241-0.013,0.267,0.102c0.025,0.114,0.241,0.254,0.292,0.279c0.051,0.025,0.381,0.127,0.433,0.165c0.05,0.038,0.126,0.153,0.152,0.254c0.025,0.102,0.114,0.102,0.128,0.013c0.012-0.089-0.065-0.254,0.025-0.242c0.088,0.013,0.191-0.026,0.191-0.026s-0.243-0.165-0.331-0.203c-0.088-0.038-0.255-0.114-0.331-0.241c-0.076-0.127-0.267-0.153-0.254-0.279c0.013-0.127,0.191-0.051,0.292,0.051c0.102,0.102,0.356,0.241,0.445,0.33c0.088,0.089,0.229,0.127,0.267,0.242c0.039,0.114,0.152,0.241,0.19,0.292c0.038,0.051,0.165,0.331,0.204,0.394c0.038,0.063,0.165-0.012,0.229-0.063c0.063-0.051,0.179-0.076,0.191-0.178c0.013-0.102-0.153-0.178-0.203-0.216c-0.051-0.038,0.127-0.076,0.191-0.127c0.063-0.05,0.177-0.14,0.228-0.063c0.051,0.077,0.026,0.381,0.051,0.432c0.025,0.051,0.279,0.127,0.331,0.191c0.05,0.063,0.267,0.089,0.304,0.051c0.039-0.038,0.242,0.026,0.294,0.038c0.049,0.013,0.202-0.025,0.304-0.05c0.103-0.025,0.204-0.102,0.191,0.063c-0.013,0.165-0.051,0.419-0.179,0.546c-0.127,0.127-0.076,0.191-0.202,0.191c-0.06,0-0.113,0-0.156,0.021c-0.041-0.065-0.098-0.117-0.175-0.097c-0.152,0.038-0.344,0.038-0.47,0.19c-0.128,0.153-0.178,0.165-0.204,0.114c-0.025-0.051,0.369-0.267,0.317-0.331c-0.05-0.063-0.355-0.038-0.521-0.038c-0.166,0-0.305-0.102-0.433-0.127c-0.126-0.025-0.292,0.127-0.418,0.254c-0.128,0.127-0.216,0.038-0.331,0.038c-0.115,0-0.331-0.165-0.331-0.165s-0.216-0.089-0.305-0.089c-0.088,0-0.267-0.165-0.318-0.165c-0.05,0-0.19-0.115-0.088-0.166c0.101-0.05,0.202,0.051,0.101-0.229c-0.101-0.279-0.33-0.216-0.419-0.178c-0.088,0.039-0.724,0.025-0.775,0.025c-0.051,0-0.419,0.127-0.533,0.178c-0.116,0.051-0.318,0.115-0.369,0.14c-0.051,0.025-0.318-0.051-0.433,0.013c-0.151,0.084-0.291,0.216-0.33,0.216c-0.038,0-0.153,0.089-0.229,0.28c-0.077,0.19,0.013,0.355-0.128,0.419c-0.139,0.063-0.394,0.204-0.495,0.305c-0.102,0.101-0.229,0.458-0.355,0.623c-0.127,0.165,0,0.317,0.025,0.419c0.025,0.101,0.114,0.292-0.025,0.471c-0.14,0.178-0.127,0.266-0.191,0.279c-0.063,0.013,0.063,0.063,0.088,0.19c0.025,0.128-0.114,0.255,0.128,0.369c0.241,0.113,0.355,0.217,0.418,0.367c0.064,0.153,0.382,0.407,0.382,0.407s0.229,0.205,0.344,0.293c0.114,0.089,0.152,0.038,0.177-0.05c0.025-0.09,0.178-0.104,0.355-0.104c0.178,0,0.305,0.04,0.483,0.014c0.178-0.025,0.356-0.141,0.42-0.166c0.063-0.025,0.279-0.164,0.443-0.063c0.166,0.103,0.141,0.241,0.23,0.332c0.088,0.088,0.24,0.037,0.355-0.051c0.114-0.09,0.064-0.052,0.203,0.025c0.14,0.075,0.204,0.151,0.077,0.267c-0.128,0.113-0.051,0.293-0.128,0.47c-0.076,0.178-0.063,0.203,0.077,0.278c0.14,0.076,0.394,0.548,0.47,0.638c0.077,0.088-0.025,0.342,0.064,0.495c0.089,0.151,0.178,0.254,0.077,0.331c-0.103,0.075-0.28,0.216-0.292,0.47s0.051,0.431,0.102,0.521s0.177,0.331,0.241,0.419c0.064,0.089,0.14,0.305,0.152,0.445c0.013,0.14-0.024,0.306,0.039,0.381c0.064,0.076,0.102,0.191,0.216,0.292c0.115,0.103,0.152,0.318,0.152,0.318s0.039,0.089,0.051,0.229c0.012,0.14,0.025,0.228,0.152,0.292c0.126,0.063,0.215,0.076,0.28,0.013c0.063-0.063,0.381-0.077,0.546-0.063c0.165,0.013,0.355-0.075,0.521-0.19s0.407-0.419,0.496-0.508c0.089-0.09,0.292-0.255,0.268-0.356c-0.025-0.101-0.077-0.203,0.024-0.254c0.102-0.052,0.344-0.152,0.356-0.229c0.013-0.077-0.09-0.395-0.115-0.457c-0.024-0.064,0.064-0.18,0.165-0.306c0.103-0.128,0.421-0.216,0.471-0.267c0.051-0.053,0.191-0.267,0.217-0.433c0.024-0.167-0.051-0.369,0-0.457c0.05-0.09,0.013-0.165-0.103-0.268c-0.114-0.102-0.089-0.407-0.127-0.457c-0.037-0.051-0.013-0.319,0.063-0.345c0.076-0.023,0.242-0.279,0.344-0.393c0.102-0.114,0.394-0.47,0.534-0.496c0.139-0.025,0.355-0.229,0.368-0.343c0.013-0.115,0.38-0.547,0.394-0.635c0.013-0.09,0.166-0.42,0.102-0.497c-0.062-0.076-0.559,0.115-0.622,0.141c-0.064,0.025-0.241,0.127-0.446,0.113c-0.202-0.013-0.114-0.177-0.127-0.254c-0.012-0.076-0.228-0.368-0.279-0.381c-0.051-0.012-0.203-0.166-0.267-0.317c-0.063-0.153-0.152-0.343-0.254-0.458c-0.102-0.114-0.165-0.38-0.268-0.559c-0.101-0.178-0.189-0.407-0.279-0.572c-0.021-0.041-0.045-0.079-0.067-0.117c0.118-0.029,0.289-0.082,0.31-0.009c0.024,0.088,0.165,0.279,0.19,0.419s0.165,0.089,0.178,0.216c0.014,0.128,0.14,0.433,0.19,0.47c0.052,0.038,0.28,0.242,0.318,0.318c0.038,0.076,0.089,0.178,0.127,0.369c0.038,0.19,0.076,0.444,0.179,0.482c0.102,0.038,0.444-0.064,0.508-0.102s0.482-0.242,0.635-0.255c0.153-0.012,0.179-0.115,0.368-0.152c0.191-0.038,0.331-0.177,0.458-0.28c0.127-0.101,0.28-0.355,0.33-0.444c0.052-0.088,0.179-0.152,0.115-0.253c-0.063-0.103-0.331-0.254-0.433-0.268c-0.102-0.012-0.089-0.178-0.152-0.178s-0.051,0.088-0.178,0.153c-0.127,0.063-0.255,0.19-0.344,0.165s0.026-0.089-0.113-0.203s-0.192-0.14-0.192-0.228c0-0.089-0.278-0.255-0.304-0.382c-0.026-0.127,0.19-0.305,0.254-0.19c0.063,0.114,0.115,0.292,0.279,0.368c0.165,0.076,0.318,0.204,0.395,0.229c0.076,0.025,0.267-0.14,0.33-0.114c0.063,0.024,0.191,0.253,0.306,0.292c0.113,0.038,0.495,0.051,0.559,0.051s0.33,0.013,0.381-0.063c0.051-0.076,0.089-0.076,0.153-0.076c0.062,0,0.177,0.229,0.267,0.254c0.089,0.025,0.254,0.013,0.241,0.179c-0.012,0.164,0.076,0.305,0.165,0.317c0.09,0.012,0.293-0.191,0.293-0.191s0,0.318-0.012,0.433c-0.014,0.113,0.139,0.534,0.139,0.534s0.19,0.393,0.241,0.482s0.267,0.355,0.267,0.47c0,0.115,0.025,0.293,0.103,0.293c0.076,0,0.152-0.203,0.24-0.331c0.091-0.126,0.116-0.305,0.153-0.432c0.038-0.127,0.038-0.356,0.038-0.444c0-0.09,0.075-0.166,0.255-0.242c0.178-0.076,0.304-0.292,0.456-0.407c0.153-0.115,0.141-0.305,0.446-0.305c0.305,0,0.278,0,0.355-0.077c0.076-0.076,0.151-0.127,0.19,0.013c0.038,0.14,0.254,0.343,0.292,0.394c0.038,0.052,0.114,0.191,0.103,0.344c-0.013,0.152,0.012,0.33,0.075,0.33s0.191-0.216,0.191-0.216s0.279-0.189,0.267,0.013c-0.014,0.203,0.025,0.419,0.025,0.545c0,0.053,0.042,0.135,0.088,0.21c-0.005,0.059-0.004,0.119-0.009,0.178C27.388,17.153,27.387,17.327,27.436,17.39zM20.382,12.064c0.076,0.05,0.102,0.127,0.152,0.203c0.052,0.076,0.14,0.05,0.203,0.114c0.063,0.064-0.178,0.14-0.075,0.216c0.101,0.077,0.151,0.381,0.165,0.458c0.013,0.076-0.279,0.114-0.369,0.102c-0.089-0.013-0.354-0.102-0.445-0.127c-0.089-0.026-0.139-0.343-0.025-0.331c0.116,0.013,0.141-0.025,0.267-0.139c0.128-0.115-0.189-0.166-0.278-0.191c-0.089-0.025-0.268-0.305-0.331-0.394c-0.062-0.089-0.014-0.228,0.141-0.331c0.076-0.051,0.279,0.063,0.381,0c0.101-0.063,0.203-0.14,0.241-0.165c0.039-0.025,0.293,0.038,0.33,0.114c0.039,0.076,0.191,0.191,0.141,0.229c-0.052,0.038-0.281,0.076-0.356,0c-0.075-0.077-0.255,0.012-0.268,0.152C20.242,12.115,20.307,12.013,20.382,12.064zM16.875,12.28c-0.077-0.025,0.025-0.178,0.102-0.229c0.075-0.051,0.164-0.178,0.241-0.305c0.076-0.127,0.178-0.14,0.241-0.127c0.063,0.013,0.203,0.241,0.241,0.318c0.038,0.076,0.165-0.026,0.217-0.051c0.05-0.025,0.127-0.102,0.14-0.165s0.127-0.102,0.254-0.102s0.013,0.102-0.076,0.127c-0.09,0.025-0.038,0.077,0.113,0.127c0.153,0.051,0.293,0.191,0.459,0.279c0.165,0.089,0.19,0.267,0.088,0.292c-0.101,0.025-0.406,0.051-0.521,0.038c-0.114-0.013-0.254-0.127-0.419-0.153c-0.165-0.025-0.369-0.013-0.433,0.077s-0.292,0.05-0.395,0.05c-0.102,0-0.228,0.127-0.253,0.077C16.875,12.534,16.951,12.306,16.875,12.28zM17.307,9.458c0.063-0.178,0.419,0.038,0.355,0.127C17.599,9.675,17.264,9.579,17.307,9.458zM17.802,18.584c0.063,0.102-0.14,0.431-0.254,0.407c-0.113-0.027-0.076-0.318-0.038-0.382C17.548,18.545,17.769,18.529,17.802,18.584zM13.189,12.674c0.025-0.051-0.039-0.153-0.127-0.013C13.032,12.71,13.164,12.725,13.189,12.674zM20.813,8.035c0.141,0.076,0.339,0.107,0.433,0.013c0.076-0.076,0.013-0.204-0.05-0.216c-0.064-0.013-0.104-0.115,0.062-0.203c0.165-0.089,0.343-0.204,0.534-0.229c0.19-0.025,0.622-0.038,0.774,0c0.152,0.039,0.382-0.166,0.445-0.254s-0.203-0.152-0.279-0.051c-0.077,0.102-0.444,0.076-0.521,0.051c-0.076-0.025-0.686,0.102-0.812,0.102c-0.128,0-0.179,0.152-0.356,0.229c-0.179,0.076-0.42,0.191-0.509,0.229c-0.088,0.038-0.177,0.19-0.101,0.216C20.509,7.947,20.674,7.959,20.813,8.035zM14.142,12.674c0.064-0.089-0.051-0.217-0.114-0.217c-0.12,0-0.178,0.191-0.103,0.254C14.002,12.776,14.078,12.763,14.142,12.674zM14.714,13.017c0.064,0.025,0.114,0.102,0.165,0.114c0.052,0.013,0.217,0,0.167-0.127s-0.167-0.127-0.204-0.127c-0.038,0-0.203-0.038-0.267,0C14.528,12.905,14.65,12.992,14.714,13.017zM11.308,10.958c0.101,0.013,0.217-0.063,0.305-0.101c0.088-0.038,0.216-0.114,0.216-0.229c0-0.114-0.025-0.216-0.077-0.267c-0.051-0.051-0.14-0.064-0.216-0.051c-0.115,0.02-0.127,0.14-0.203,0.14c-0.076,0-0.165,0.025-0.14,0.114s0.077,0.152,0,0.19C11.117,10.793,11.205,10.946,11.308,10.958zM11.931,10.412c0.127,0.051,0.394,0.102,0.292,0.153c-0.102,0.051-0.28,0.19-0.305,0.267s0.216,0.153,0.216,0.153s-0.077,0.089-0.013,0.114c0.063,0.025,0.102-0.089,0.203-0.089c0.101,0,0.304,0.063,0.406,0.063c0.103,0,0.267-0.14,0.254-0.229c-0.013-0.089-0.14-0.229-0.254-0.28c-0.113-0.051-0.241-0.28-0.317-0.331c-0.076-0.051,0.076-0.178-0.013-0.267c-0.09-0.089-0.153-0.076-0.255-0.14c-0.102-0.063-0.191,0.013-0.254,0.089c-0.063,0.076-0.14-0.013-0.217,0.012c-0.102,0.035-0.063,0.166-0.012,0.229C11.714,10.221,11.804,10.361,11.931,10.412zM24.729,17.198c-0.083,0.037-0.153,0.47,0,0.521c0.152,0.052,0.241-0.202,0.191-0.267C24.868,17.39,24.843,17.147,24.729,17.198zM20.114,20.464c-0.159-0.045-0.177,0.166-0.304,0.306c-0.128,0.141-0.267,0.254-0.317,0.241c-0.052-0.013-0.331,0.089-0.242,0.279c0.089,0.191,0.076,0.382-0.013,0.472c-0.089,0.088,0.076,0.342,0.052,0.482c-0.026,0.139,0.037,0.229,0.215,0.229s0.242-0.064,0.318-0.229c0.076-0.166,0.088-0.331,0.164-0.47c0.077-0.141,0.141-0.434,0.179-0.51c0.038-0.075,0.114-0.316,0.102-0.457C20.254,20.669,20.204,20.489,20.114,20.464zM10.391,8.802c-0.069-0.06-0.229-0.102-0.306-0.11c-0.076-0.008-0.152,0.06-0.321,0.06c-0.168,0-0.279,0.067-0.347,0C9.349,8.684,9.068,8.65,9.042,8.692C9.008,8.749,8.941,8.751,9.008,8.87c0.069,0.118,0.12,0.186,0.179,0.178s0.262-0.017,0.288,0.051C9.5,9.167,9.569,9.226,9.712,9.184c0.145-0.042,0.263-0.068,0.296-0.119c0.033-0.051,0.263-0.059,0.263-0.059S10.458,8.861,10.391,8.802z"
    }));

    backContainer.events.on("click", function () {
        chart.goHome();
        worldSeries.show();
        countrySeries.hide();
        backContainer.hide();
    });
}


window.GenerateChart = function() {
    var root = am5.Root.new("chartdiv");

    const myTheme = am5.Theme.new(root);

    myTheme.rule("AxisLabel", ["minor"]).setAll({
        dy: 1
    });

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
        am5themes_Animated.new(root),
        myTheme,
        am5themes_Responsive.new(root)
    ]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0
    }));


    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        behavior: "zoomX"
    }));
    cursor.lineY.set("visible", false);

    var date = new Date();
    date.setHours(0, 0, 0, 0);
    var value = 100;

    function generateData() {
        value = Math.round((Math.random() * 10 - 5) + value);
        am5.time.add(date, "day", 1);
        return {
            date: date.getTime(),
            value: value
        };
    }

    function generateDatas(count) {
        var data = [];
        for (var i = 0; i < count; ++i) {
            data.push(generateData());
        }
        return data;
    }


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
        maxDeviation: 0,
        baseInterval: {
            timeUnit: "day",
            count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {
            minorGridEnabled: true,
            minorLabelsEnabled: true
        }),
        tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.set("minorDateFormats", {
        "day": "dd",
        "month": "MM"
    });


    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
    }));


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}"
        })
    }));

    series.columns.template.setAll({ strokeOpacity: 0 })


    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
        orientation: "horizontal"
    }));

    var data = generateDatas(30);
    series.data.setAll(data);


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);

}


function GeneratePieChart() {
    // Define data for each year
    var chartData = {
        "1995": [
            { sector: "Agriculture", size: 6.6 },
            { sector: "Mining and Quarrying", size: 0.6 },
            { sector: "Manufacturing", size: 23.2 },
            { sector: "Electricity and Water", size: 2.2 },
            { sector: "Construction", size: 4.5 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 14.6 },
            { sector: "Transport and Communication", size: 9.3 },
            { sector: "Finance, real estate and business services", size: 22.5 }],
        "1996": [
            { sector: "Agriculture", size: 6.4 },
            { sector: "Mining and Quarrying", size: 0.5 },
            { sector: "Manufacturing", size: 22.4 },
            { sector: "Electricity and Water", size: 2 },
            { sector: "Construction", size: 4.2 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 14.8 },
            { sector: "Transport and Communication", size: 9.7 },
            { sector: "Finance, real estate and business services", size: 22 }],
        "1997": [
            { sector: "Agriculture", size: 6.1 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 20.9 },
            { sector: "Electricity and Water", size: 1.8 },
            { sector: "Construction", size: 4.2 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 13.7 },
            { sector: "Transport and Communication", size: 9.4 },
            { sector: "Finance, real estate and business services", size: 22.1 }],
        "1998": [
            { sector: "Agriculture", size: 6.2 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 21.4 },
            { sector: "Electricity and Water", size: 1.9 },
            { sector: "Construction", size: 4.2 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 14.5 },
            { sector: "Transport and Communication", size: 10.6 },
            { sector: "Finance, real estate and business services", size: 23 }],
        "1999": [
            { sector: "Agriculture", size: 5.7 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 20 },
            { sector: "Electricity and Water", size: 1.8 },
            { sector: "Construction", size: 4.4 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.2 },
            { sector: "Transport and Communication", size: 10.5 },
            { sector: "Finance, real estate and business services", size: 24.7 }],
        "2000": [
            { sector: "Agriculture", size: 5.1 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 20.4 },
            { sector: "Electricity and Water", size: 1.7 },
            { sector: "Construction", size: 4 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.3 },
            { sector: "Transport and Communication", size: 10.7 },
            { sector: "Finance, real estate and business services", size: 24.6 }],
        "2001": [
            { sector: "Agriculture", size: 5.5 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 20.3 },
            { sector: "Electricity and Water", size: 1.6 },
            { sector: "Construction", size: 3.1 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.3 },
            { sector: "Transport and Communication", size: 10.7 },
            { sector: "Finance, real estate and business services", size: 25.8 }],
        "2002": [
            { sector: "Agriculture", size: 5.7 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 20.5 },
            { sector: "Electricity and Water", size: 1.6 },
            { sector: "Construction", size: 3.6 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.1 },
            { sector: "Transport and Communication", size: 10.7 },
            { sector: "Finance, real estate and business services", size: 26 }],
        "2003": [
            { sector: "Agriculture", size: 4.9 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 19.4 },
            { sector: "Electricity and Water", size: 1.5 },
            { sector: "Construction", size: 3.3 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.2 },
            { sector: "Transport and Communication", size: 11 },
            { sector: "Finance, real estate and business services", size: 27.5 }],
        "2004": [
            { sector: "Agriculture", size: 4.7 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 18.4 },
            { sector: "Electricity and Water", size: 1.4 },
            { sector: "Construction", size: 3.3 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.9 },
            { sector: "Transport and Communication", size: 10.6 },
            { sector: "Finance, real estate and business services", size: 28.1 }],
        "2005": [
            { sector: "Agriculture", size: 4.3 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 18.1 },
            { sector: "Electricity and Water", size: 1.4 },
            { sector: "Construction", size: 3.9 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.7 },
            { sector: "Transport and Communication", size: 10.6 },
            { sector: "Finance, real estate and business services", size: 29.1 }],
        "2006": [
            { sector: "Agriculture", size: 4 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 16.5 },
            { sector: "Electricity and Water", size: 1.3 },
            { sector: "Construction", size: 3.7 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 14.2 },
            { sector: "Transport and Communication", size: 12.1 },
            { sector: "Finance, real estate and business services", size: 29.1 }],
        "2007": [
            { sector: "Agriculture", size: 4.7 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 16.2 },
            { sector: "Electricity and Water", size: 1.2 },
            { sector: "Construction", size: 4.1 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.6 },
            { sector: "Transport and Communication", size: 11.2 },
            { sector: "Finance, real estate and business services", size: 30.4 }],
        "2008": [
            { sector: "Agriculture", size: 4.9 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 17.2 },
            { sector: "Electricity and Water", size: 1.4 },
            { sector: "Construction", size: 5.1 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.4 },
            { sector: "Transport and Communication", size: 11.1 },
            { sector: "Finance, real estate and business services", size: 28.4 }],
        "2009": [
            { sector: "Agriculture", size: 4.7 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 16.4 },
            { sector: "Electricity and Water", size: 1.9 },
            { sector: "Construction", size: 4.9 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.5 },
            { sector: "Transport and Communication", size: 10.9 },
            { sector: "Finance, real estate and business services", size: 27.9 }],
        "2010": [
            { sector: "Agriculture", size: 4.2 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 16.2 },
            { sector: "Electricity and Water", size: 2.2 },
            { sector: "Construction", size: 4.3 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.7 },
            { sector: "Transport and Communication", size: 10.2 },
            { sector: "Finance, real estate and business services", size: 28.8 }],
        "2011": [
            { sector: "Agriculture", size: 4.1 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 14.9 },
            { sector: "Electricity and Water", size: 2.3 },
            { sector: "Construction", size: 5 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 17.3 },
            { sector: "Transport and Communication", size: 10.2 },
            { sector: "Finance, real estate and business services", size: 27.2 }],
        "2012": [
            { sector: "Agriculture", size: 3.8 },
            { sector: "Mining and Quarrying", size: 0.3 },
            { sector: "Manufacturing", size: 14.9 },
            { sector: "Electricity and Water", size: 2.6 },
            { sector: "Construction", size: 5.1 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 15.8 },
            { sector: "Transport and Communication", size: 10.7 },
            { sector: "Finance, real estate and business services", size: 28 }],
        "2013": [
            { sector: "Agriculture", size: 3.7 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 14.9 },
            { sector: "Electricity and Water", size: 2.7 },
            { sector: "Construction", size: 5.7 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.5 },
            { sector: "Transport and Communication", size: 10.5 },
            { sector: "Finance, real estate and business services", size: 26.6 }],
        "2014": [
            { sector: "Agriculture", size: 3.9 },
            { sector: "Mining and Quarrying", size: 0.2 },
            { sector: "Manufacturing", size: 14.5 },
            { sector: "Electricity and Water", size: 2.7 },
            { sector: "Construction", size: 5.6 },
            { sector: "Trade (Wholesale, Retail, Motor)", size: 16.6 },
            { sector: "Transport and Communication", size: 10.5 },
            { sector: "Finance, real estate and business services", size: 26.5 }]
    };

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("piechart");


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
        am5themes_Animated.new(root)
    ]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    var chart = root.container.children.push(am5percent.PieChart.new(root, {
        innerRadius: 100,
        layout: root.verticalLayout
    }));


    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    var series = chart.series.push(am5percent.PieSeries.new(root, {
        valueField: "size",
        categoryField: "sector"
    }));


    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series.data.setAll([
        { sector: "Agriculture", size: 6.6 },
        { sector: "Mining and Quarrying", size: 0.6 },
        { sector: "Manufacturing", size: 23.2 },
        { sector: "Electricity and Water", size: 2.2 },
        { sector: "Construction", size: 4.5 },
        { sector: "Trade (Wholesale, Retail, Motor)", size: 14.6 },
        { sector: "Transport and Communication", size: 9.3 },
        { sector: "Finance, real estate and business services", size: 22.5 }
    ]);


    // Play initial series animation
    // https://www.amcharts.com/docs/v5/concepts/animations/#Animation_of_series
    series.appear(1000, 100);


    // Add label
    var label = root.tooltipContainer.children.push(am5.Label.new(root, {
        x: am5.p50,
        y: am5.p50,
        centerX: am5.p50,
        centerY: am5.p50,
        fill: am5.color(0x000000),
        fontSize: 50
    }));


    // Animate chart data
    var currentYear = 1995;
    function getCurrentData() {
        var data = chartData[currentYear];
        currentYear++;
        if (currentYear > 2014)
            currentYear = 1995;
        return data;
    }

    function loop() {
        label.set("text", currentYear);
        var data = getCurrentData();
        for (var i = 0; i < data.length; i++) {
            series.data.setIndex(i, data[i]);
        }
        chart.setTimeout(loop, 4000);
    }

    loop();

}