class Map{
    
    constructor(
        father,         //id du parent auquel rattacher la Map
        id,             //id de la Map
        lat,            //latitude du centre de la Map
        lng,            //longitude du centre de la Map
        initialZoom){   //zoom initial sur le centre de la Map


        //Construction de l'élément DOM de la map
        $("#"+father).append("<div id="+id+"></div>")
        //Construction de la Map leaflet
        this.map = L.map(id).setView([lat,lng],initialZoom)
        L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png").addTo(this.map)
    }
}

class Panel{

    constructor(
        father, //parent auquel rattacher le pannel
        id){    //id du pannel

        this.id = id

        //Construction de l'élément DOM du Panel
        $("#"+father).append("<div id="+id+"></div>")
        //Construction de la partie information du Panel
        $("#"+id).append("<div id="+id+"-info></div>")
        //Construction de la partie formulaire du Panel
        $("#"+id).append("<div id="+id+"-form></div>")
        //Construction de la partie récapitulatif
        $("#"+id).append("<div id="+id+"-recap></div>")
    }

    //Affiche les informations de la station dans l'encart info du Panel
    displayInfos(
        address,    //adresse de la station
        status,     //status de la station
        places,     //places disponibles de la station
        bikes){     //vélos disponibles dans la station

        this.status = status
        this.bikes = bikes

        //Construction dans le DOM de la partie infos
        $("#"+this.id+"-info").html("")
        $("#"+this.id+"-info").append("<h3>Informations de la station</h3")
        $("#"+this.id+"-info").append("<p>"+address+"</p>")
        $("#"+this.id+"-info").append("<div id="+this.id+"-data></div>")
        $("#"+this.id+"-data").css("display","flex")

        //On affiche l'image correspondant au status de la station à gauche
        if(status === "OPEN" && bikes > 0){
            $("#"+this.id+"-data").append("<div><img src='images/ouvert.png'/></div>")
        } else {
            $("#"+this.id+"-data").append("<div><img src='images/ferme.png'/></div>")
        }

        //affichage des infos de la station au milieu
        $("#"+this.id+"-data").append("<div><p style='margin-top:30%;'>"+places+" places</p><p>"+bikes+" vélos</p></div>")
        
        //affichage de l'image de vélo à droite
        $("#"+this.id+"-data").append("<div><img src='images/bike.png'/></div>")
    }

    //Construit le formulaire d'inscription
    displayForm(){

        $("#"+this.id+"-form").html("")

        if(this.bikes > 0 && this.status === "OPEN"){
            $("#"+this.id+"-form").append("<form id="+this.id+"-user></form>")
            $("#"+this.id+"-user").append("<label for='nom'>nom : </label>")
            $("#"+this.id+"-user").append("<input type='text' name='nom' id='nom' placeholder='Entrez votre nom' required />")
            $("#"+this.id+"-user").append("<label for='prenom'>prénom : </label>")
            $("#"+this.id+"-user").append("<input type='text' name='prenom' id='prenom' placeholder='Entrez votre prénom' required />")
            $("#"+this.id+"-user").append("<button id="+this.id+"-confirm>Valider</button>")
        }

        else if(this.bikes === 0){
            $("#"+this.id+"-form").append("<p>Il n'y a aucun vélo disponible</p>")
        }

        else if(this.status !== "OPEN"){
            $("#"+this.id+"-form").append("<p>La station est fermée</p>")
        }
    }
}

class Station{

    constructor(
        address,    //adresse de la station
        places,     //places disponibles de la station
        bikes,      //vélos disponibles dans la station
        lat,        //latitude de la station
        lng,        //longitude de la station
        status){    //status de la station
             
        this.address = address    
        this.places = places    
        this.bikes = bikes     
        this.lat = lat       
        this.lng = lng       
        this.status = status
        this.isSelected = false
        this.hasReservation = false

    }

    setMarker(LeafletMap){  //map sur laquelle le marqueur devra s'afficher

        //Construction des differents marqueurs
        var emptyStation = L.icon({
            iconUrl: "images/emptyStation.png",
            iconSize: [25, 40],
            iconAnchor: [15, 39]
        })
        var almostEmptyStation = L.icon({
            iconUrl: "images/almostEmptyStation.png",
            iconSize: [25, 40],
            iconAnchor: [15, 39]
        })
        var midStation = L.icon({
            iconUrl: "images/midStation.png",
            iconSize: [25, 40],
            iconAnchor: [15, 39]
        })
        var fullStation = L.icon({
            iconUrl: "images/fullStation.png",
            iconSize: [25, 40],
            iconAnchor: [15, 39]
        })
        
        //Sélection du marqueur à afficher sur la map
        //SI il n'y a plus de vélo ou que la station est fermée
        if(this.bikes === 0 || this.status !== "OPEN"){
            this.marker = L.marker([this.lat, this.lng],{icon: emptyStation}).addTo(LeafletMap)
        }
        //OU SI il y a moins de la moitié des vélos disponibles
        else if(this.bikes <= (this.bikes+this.places)/2){
            this.marker = L.marker([this.lat, this.lng],{icon: almostEmptyStation}).addTo(LeafletMap)
        }
        //OU SI il y a entre la moitié et les 3/4 des vélos disponibles
        else if(this.bikes >= (this.bikes+this.places)/2 &&
                this.bikes <= (this.bikes+this.places)*3/4){
            this.marker = L.marker([this.lat, this.lng],{icon: midStation}).addTo(LeafletMap)
        }
        //OU SI il y a plus des 3/4 des vélos disponibles
        else if(this.bikes >= (this.bikes+this.places)*3/4){
            this.marker = L.marker([this.lat, this.lng],{icon: fullStation}).addTo(LeafletMap)
        }
    }

    update(
        newPlaces,  //nouveau nombre de places disponibles pour la station
        newBikes,   //nouveau nombre de vélos disponibles pour la station
        newStatus){ //nouveau statut de la station  

        this.places = newPlaces    
        this.bikes = newBikes
        this.statut = newStatus

        //Si on réserve dans la station, on décompte 1 place de moins
        if(this.hasReservation === true){
            this.bikes -= 1
        }
    }
}

class Signature{

    constructor(father, id){

        //Construction de la signature
        $("#"+father).html("")
        $("#"+father).append("<canvas id="+id+"></canvas>")
        $("#"+father).append("<form id="+id+"-form></form>")
        $("#"+id+"-form").append("<button id="+id+"-reset>Reset</button>")
        $("#"+id+"-form").append("<button id="+id+"-confirm>Confirmer</button>")

        //Référence vers la signature
        var self = this
        
        //fonctions servant dans les events listeners
        //-----------------------------------------------------------------------------
        //Quand l'utilisateur pose le stylo
        function putpen(e){
            
            self.isWriting = true
            // Coordonnées de la souris :
            self.cursorX = (e.pageX - self.canvas.offsetLeft)
            self.cursorY = (e.pageY - self.canvas.offsetTop)
        }
        
        //Quand l'utilisateur lève le stylo
        function liftpen(){
            
            self.isWriting = false
            self.isStarting = false
        }
        
        //Quand l'utilisateur bouge le stylo
        function movepen(e){
            
            if(self.isWriting){ // Si je suis en train de dessiner (click souris enfoncé) :

                self.cursorX = (e.pageX - self.canvas.offsetLeft)
                self.cursorY = (e.pageY - self.canvas.offsetTop)

                if (!self.isStarting){ // Si c'est le début, j'initialise
                    
                    // Je place mon curseur pour la première fois :
                    self.ctx.beginPath()
                    self.ctx.moveTo(self.cursorX, self.cursorY)
                    self.isStarting = true

                } else { // Sinon je dessine

                    self.ctx.lineTo(self.cursorX, self.cursorY)
                    self.ctx.stroke()
                }
            }
        }
        //-------------------------------------------------------------------------------
        //Reset de la signature
        $("#"+id+"-reset").css("display","inline")
        $("#"+id+"-confirm").css("display","inline")
        
        this.canvas = $("#"+id).get(0)
        this.ctx = this.canvas.getContext("2d")
        //Reset du canvas
        this.ctx.clearRect(0,0, self.canvas.width, self.canvas.height)

        //variables servant dans les gestions d'évènements
        this.isStarting = false
        this.isWriting = false

        //esthetique de la signature
        this.ctx.lineJoin = "round"
        this.ctx.lineCap = "round"
        
        //Gestion des Evènements
        this.canvas.addEventListener("mousedown", putpen)
        this.canvas.addEventListener("mouseup", liftpen)
        this.canvas.addEventListener("mousemove", movepen)

        $("#"+id+"-reset").click(function(e){

            e.preventDefault()
            self.ctx.clearRect(0,0, self.canvas.width, self.canvas.height)
        })
        
        //On supprime les fonctionnalités de la signature
        $("#"+id+"-confirm").click(function(e){

            e.preventDefault()
            
            $("#"+id+"-reset").css("display","none")
            $("#"+id+"-confirm").css("display","none")

            self.canvas.removeEventListener("mousedown", putpen)
            self.canvas.removeEventListener("mouseup", liftpen)
            self.canvas.removeEventListener("mousemove", movepen)
            
            $("#"+id).css("background-color","#CCC")       
        })
    } 
}