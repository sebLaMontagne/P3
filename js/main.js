$(function(){

    //Création du Slider
    var container = new SliderContainer(
        "slider1",          //id que prendra le slider
        "#tutoriel",        //élément du DOM auquel le slider sera rattaché 
        9,                  //nombre de slides
        500,                //longueur des slides
        300,                //hauteur des slides
        100)                //perspective en CSS du contenant
    
    //Mise en forme du Slider ; les classes sont retrouvables dans le fichier "slider.css"
    $("#slider1").addClass("myslider")
    $("#slider1-Slider>div").addClass("mydiapo")
    $("#slider1-Bar").addClass("mycontrolbar")
    
    //évènements produits lorsqu'on clique sur les boutons de la barre de contrôle
    $("#slider1-Button0").click(function(){ container.slider.setStart() })
    $("#slider1-Button1").click(function(){ container.slider.previousSlide() })
    $("#slider1-Button2").click(function(){ switch_pause_play() })
    $("#slider1-Button3").click(function(){ container.slider.nextSlide() })
    $("#slider1-Button4").click(function(){ container.slider.setEnd() })
    
    //évènements produits lorsqu'on appuie sur les touches du clavier
    $(document).keydown(function(e){
        //touche droite
        if(e.keyCode === 39){ container.slider.nextSlide() }
        //touche gauche
        else if(e.keyCode === 37){ container.slider.previousSlide() }
        //touche espace
        else if(e.keyCode === 32){ switch_pause_play() }
    })
  
    //Le Slider passe à la slide suivante toutes les 5 secondes
    container.slider.startNextSlideforSetInterval()

    

    //Partie application
    //Création des variables

    //Création de la map
    var myMap = new Map("application", "map", 45.75, 4.85, 15)
    //Création du panneau
    var myPanel = new Panel("application", "pannel")

    //Variable récupérant la réponse brut de l'API
    var data = null
    //Variable centralisant les stations
    var stations = new Array()


    //Initialisation de l'application
    retrieveFirstData()
    setStationsData()
    setStationsMarkers()
    setReservation()

    //Boucle d'actualisation
    setInterval(function(){

        retrieveData()
        updateStationsData()
        updatePanelInfo()
        
    },10000)

    //fonctions utilisées
    //Gère le pause/play du slider 
    function switch_pause_play(){
        
        //SI l'animation est active
        if($("#slider1-Button2").hasClass("fa-pause-circle")){
            
            //On met à jour le feedback visuel...
            $("#slider1-Button2").removeClass("fa-pause-circle")
            $("#slider1-Button2").addClass("fa-play-circle")
            //Puis on arrête l'animation
            container.slider.stopNextSlideforSetInterval()
        
        //SINON SI l'animation est en pause
        } else if($("#slider1-Button2").hasClass("fa-play-circle")){
            
            //On met à jour le feedback visuel...
            $("#slider1-Button2").removeClass("fa-play-circle")
            $("#slider1-Button2").addClass("fa-pause-circle")
            //Puis on démarre l'animation
            container.slider.startNextSlideforSetInterval()
        }
    }

    //Récupération des infos de l'API pour la première fois (synchrone)
    function retrieveFirstData(){
        
        $.ajax({
        url:"https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=8f85629b3ed9fbf4563a5e60b7c6d8fa575edbcb",
        async: false,
        error: function(){ console.log("erreur de chargement")},
        success: function(response){data = response}
        })
    }
    
    //Récupération des infos de l'API (asynchrone)
    function retrieveData(){
        
        $.ajax({
        url:"https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=8f85629b3ed9fbf4563a5e60b7c6d8fa575edbcb",
        error: function(){ console.log("erreur de chargement")},
        success: function(response){data = response}
        })
    }

    //Remplit la liste des stations à partir des données de l'API
    function setStationsData(){

        for(let i = 0; i < data.length; i++){

            var station = new Station(
                data[i].address,
                data[i].available_bike_stands,
                data[i].available_bikes,
                data[i].position.lat,
                data[i].position.lng,
                data[i].status)

            stations.push(station)
        }
    }

    //Ajout des marqueurs sur la map 
    function setStationsMarkers(){

        for(let i = 0; i < stations.length; i++){

            stations[i].setMarker(myMap.map)
            //Si on clique sur un marqueur...
            stations[i].marker.on("click", function(){
                
                //On reset le marqueur déterminant quelle station a été sélectionnée
                for(let i = 0; i < stations.length; i++){
                    stations[i].isSelected = false
                }
                //La station cliquée est repérée comme étant sélectionnée
                stations[i].isSelected = true
                //On affiche les infos de la station sélectionnée
                myPanel.displayInfos(
                    stations[i].address,
                    stations[i].status,
                    stations[i].places,
                    stations[i].bikes)
                //On affiche le formulaire de sélection
                myPanel.displayForm()

                //Lorsque le formulaire est confirmé,
                $("#pannel-user").click(function(e){

                    if($("#prenom").val()!=="" && $("#nom").val()!==""){

                        e.preventDefault()
                        var nom = $("#nom").val()
                        var prenom = $("#prenom").val()

                        //On affiche la signature
                        var signature = new Signature("pannel-form","signature")

                        //Lorsque l'utilisateur confirme la signature,
                        $("#signature-confirm").click(function(e){

                            e.preventDefault()

                            //on reset le marqueur de réservation pour effacer la réservation précédente s'il y en a une
                            for(let j = 0; j < stations.length; j++){
                                stations[j].hasReservation = false
                            }

                            //On enregistre les données de l'utilisateur pour pouvoir les conserver le temps de la session
                            sessionStorage.nom = nom
                            sessionStorage.prenom = prenom
                            sessionStorage.minutes = 20
                            sessionStorage.secondes = 0
                            sessionStorage.i = i

                            //On effectue alors la réservation
                            setReservation()
                        })
                    }
                })
            })
        }
    }

    //Met à jour les données de la liste
    function updateStationsData(){

        for(let i = 0; i < stations.length; i++){
            stations[i].update(
                data[i].available_bike_stands,
                data[i].available_bikes,
                data[i].status)
        }
    }

    //Met à jour la partie infos de la liste
    function updatePanelInfo(){

        for(let i = 0; i < stations.length; i++){
            if(stations[i].isSelected === true){

                myPanel.displayInfos(
                    stations[i].address,
                    stations[i].status,
                    stations[i].places,
                    stations[i].bikes)
            }
        }
    }

    //gère l'affichage du récapitulatif
    function setReservation(){

        //si on a déjà les infos de réservation, on les affiche
        if( sessionStorage.getItem("nom") !== null &&
            sessionStorage.getItem("prenom") !== null &&
            sessionStorage.getItem("minutes") !== null &&
            sessionStorage.getItem("secondes") !== null &&
            sessionStorage.getItem("i") !== null){

            //La station cliquée est repérée comme étant sélectionnée
            stations[sessionStorage.i].hasReservation = true

            //Mise à jour du récapitulatif de réservation
            var intervalID = setInterval(function(){

                //Construction du récapitulatif
                $("#pannel-recap").html("")
                $("#pannel-recap").append("<h3>Récapitulatif</h3")
                $("#pannel-recap").append("<p>Vélo réservé à la station <span style='font-weight:bold;'>"+stations[sessionStorage.i].address+"</span></p>")
                $("#pannel-recap").append("<p>par <span style='font-weight:bold;'>"+sessionStorage.prenom+" "+sessionStorage.nom+"</span></p>")

                //Affichage du décompte, ajoute un "0" devant tous les nombres inférieurs à 10 dans le décompte
                if(sessionStorage.minutes > 9 && sessionStorage.secondes > 9){
                    $("#pannel-recap").append("<p>Temps restant : "+sessionStorage.minutes+" min "+sessionStorage.secondes+" sec</p>")
                } else if(sessionStorage.minutes <= 9 && sessionStorage.secondes > 9){
                    $("#pannel-recap").append("<p>Temps restant : 0"+sessionStorage.minutes+" min "+sessionStorage.secondes+" sec</p>")
                } else if(sessionStorage.minutes > 9 && sessionStorage.secondes <= 9){
                    $("#pannel-recap").append("<p>Temps restant : "+sessionStorage.minutes+" min 0"+sessionStorage.secondes+" sec</p>")
                } else if(sessionStorage.minutes <= 9 && sessionStorage.secondes <= 9){
                    $("#pannel-recap").append("<p>Temps restant : 0"+sessionStorage.minutes+" min 0"+sessionStorage.secondes+" sec</p>")
                }
                
                //Gère la fin du décompte, on annule la réservation
                if( sessionStorage.minutes == 0 && sessionStorage.secondes == 0){

                    $("#pannel-recap").html("")
                    $("#pannel-recap").append("<p>Expiration terminée</p>")
                    stations[i].hasReservation = false

                //Gère le passage des minutes
                } else if(sessionStorage.minutes > 0 && sessionStorage.secondes == 0){

                    sessionStorage.minutes -= 1
                    sessionStorage.secondes = 59

                //Gère le passage des secondes
                } else {
                    sessionStorage.secondes -= 1
                }

                //Si l'utilisateur confirme une nouvelle réservation, on annule la précédente et on reset le timer
                $("#signature-confirm").click(function(e){
                    e.preventDefault()
                    clearInterval(intervalID)
                })
            },1000)

        }    
    }
})