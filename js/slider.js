//Fonction qui lance un setInterval dans un autre scope pour éviter les conflits de "this"
function setScopedInterval(func, millis, scope) {
    return setInterval(function () {
        func.apply(scope);
    }, millis);
}

//-------------------------------------------------------------------

//Création d'un contenant pour le slider et sa barre de contrôle. Demande l'id à lui attribuer dans la page, le parent auquel le rattacher, la quantité de slides, la longueur de chaque slide, la hauteur de chaque slide, et la perspective 3D avec laquelle on va le voir.
class SliderContainer{

    constructor(id, father, slidesQuantity, slideWidth, slideHeight){

        $("<div id="+id+"></div>").appendTo(father)
        this.width = slideWidth + 2*25*(slidesQuantity-1)
        $("#"+id).css("width", this.width).css("position", "relative")

        this.slider = new Slider(id, this.width, slidesQuantity, slideWidth, slideHeight)
        this.bar = new Bar(id, this.width)
    }
}

//--------------------------------------------------------------------

//Création du slider automatique à partir du SliderContainer. Récupère tous les paramètre déjà entrés dans le SliderContainer à l'exception du parent
class Slider{

    constructor(id, containerWidth, slidesQuantity, slideWidth, slideHeight, perspective){

        this.sliderLenght = slidesQuantity
        this.id = id+"-Slider"
        $("<div id="+this.id+"></div>").appendTo($("#"+id))
        $("#"+this.id).css("perspective", 500).css("perspective-origin", (containerWidth/2)+"px "+slideHeight/2+"px").css("height", slideHeight)


        this.SlideList = Array(0)
        for(var i = 0; i < slidesQuantity; i++){

            var SlideElt = new Slide(id,i, slidesQuantity,slideWidth,slideHeight, containerWidth)
            this.SlideList.push(SlideElt)
        }
    }

    //Fait passer au slide suivant
    nextSlide(){

        if(this.SlideList[this.SlideList.length-1].index !== 0){
            for(let i = 0; i < this.sliderLenght; i++){

            this.SlideList[i].index -= 1
            this.SlideList[i].update()
            }
        } 
    }

    //Ramène au slide précédent
    previousSlide(){

        if(this.SlideList[0].index !== 0){
            for(let i = 0; i < this.sliderLenght; i++){

            this.SlideList[i].index += 1
            this.SlideList[i].update()
            }
        } 
    }

    //Remet le slider au début
    setStart(){
        for(let i = 0; i < this.SlideList.length; i++){
            this.SlideList[i].index = i
            this.SlideList[i].set()
        }
    }

    //Amène le slider à la fin
    setEnd(){
        for(let i = 0; i < this.SlideList.length; i++){
            this.SlideList[i].index = -this.SlideList.length + 1 + i
            this.SlideList[i].set()
        }
    }

    //Fait passer les slides toutes les 5 secondes. S'appuie sur setScopedInterval pour éviter les conflits de this.
    startNextSlideforSetInterval(){
        this.timer = setScopedInterval(function () { this.nextSlide() }, 5000, this)
    }

    //Arrête le passage de slides toutes les 5 secondes
    stopNextSlideforSetInterval(){
        clearInterval(this.timer)
    }
}

//--------------------------------------------------------------------

//Définit une slide du Slider. Il récupère les arguments passés au Slider et définit un index qui détermine sa position par rapport à la slide active et donc comment elle doit s'afficher dans le slider
class Slide{

    constructor(id,index,slidesQuantity, slideWidth, slideHeight, containerWidth){

        this.index = index
        this.sliderSize = slidesQuantity
        this.containerWidth = containerWidth
        this.width = slideWidth
        this.id = id+"-Slide"+index

        $("<div id="+this.id+"></div>").appendTo($("#"+id+"-Slider"))
        $("#"+this.id).css("width",slideWidth).css("height",slideHeight).css("position","absolute")

        this.set()

    }

    //Définit la position de la slide dans la scène 3D

    set(){

        if(this.index === 0){

            this.zIndex = this.sliderSize
            this.left = (this.containerWidth - this.width)/2
            this.transform = ""

        }
        else if(this.index > 0){

            this.zIndex = this.sliderSize - this.index
            this.left = (this.containerWidth + this.width)/2 + 25*(this.index)
            this.transform = "rotateY(-90deg) translateZ("+this.width/2+"px) translateX("+(-this.width/2)+"px)"

        }
        else if(this.index < 0){

            this.zIndex = this.sliderSize + this.index
            this.left = -this.width + 25*(this.index+1) + (this.sliderSize-2)*25
            this.transform = "rotateY(90deg) translateZ("+this.width/2+"px) translateX("+this.width/2+"px)"

        }
        $("#"+this.id).css("transition","")
        $("#"+this.id).css("zIndex", this.zIndex).css("transform", this.transform).css("left", this.left)
    }

    //Joue une animation lorsqu'on change de slide
    update(){

        this.set()

        if(this.index === 0 || this.index === 1 || this.index === -1){
            $("#"+this.id).css("transition","left 1s ease, transform 1s ease")
        } else {
            $("#"+this.id).css("transition","left 1s ease")
        }
    }
}

//--------------------------------------------------------------------

//Construit la barre de contrôle du Slider. Elle a besoin de l'id du SliderContainer pour pouvoir s'y rattacher ainsi que de la taille du container pour prendre la totalité de l'espace disponible
class Bar{

    //Le contructeur créé tous les bouttons directement.
    constructor(id, containerWidth){

        $("<div id="+id+"-Bar></div>").appendTo($("#"+id))
        for(var i = 0; i < 5; i++){

            if(i === 0){ var buttonElt = new Button("fa-angle-double-left", id, i)}
            else if(i === 1){ var buttonElt = new Button("fa-angle-left", id, i)}
            else if(i === 2){ var buttonElt = new Button("fa-pause-circle", id, i)}
            else if(i === 3){ var buttonElt = new Button("fa-angle-right", id, i)}
            else if(i === 4){ var buttonElt = new Button("fa-angle-double-right", id, i)}

            if(i !== 4){ $("#"+buttonElt.id).css("margin-right", ((containerWidth-150)/4)) }

            $("#"+buttonElt.id).css("font-size", "2em")
                .css("width", 30)
                .css("cursor", "pointer")
                .css("transition", "color 0.5s")
        }
    }
}

//--------------------------------------------------------------------

//Définit un boutton de la barre de controle. A besoin de fontAwesome pour pouvoir fonctionner.
class Button{

    constructor(fontAwesomeClass, id, position){

        this.id = id+"-Button"+position

        $("<div id="+this.id+"></div>").appendTo($("#"+id+"-Bar"))
        $("#"+this.id).addClass("fas").addClass(fontAwesomeClass)

    }       
}