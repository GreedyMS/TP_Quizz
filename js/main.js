$(function mainQuizz() {

    let difficulty;
    let category;
    let pseudo;

    let categorySelect;
    let levelSelect;
    let i = 0;
    let goodAnswer = 0;

    // VALIDATION DE LA CONFORMITE DU PSEUDO

    function validate(spanInput, msgErreur, regEx, msgErreur2) {

        let valid = true;

        if (spanInput.val() == "") { // SI RIEN EST ENTRER DANS L'INPUT
            valid = false;
            $(".erreurPseudo").fadeIn().text(msgErreur);
        } else if (!spanInput.val().match(regEx)) { // SI LE PSEUDO N'EST PAS CONFORME A LA REGEX
            valid = false;
            $(".erreurPseudo").fadeIn().text(msgErreur2);
        } else { // SI TOUS EST BON
            valid = true;
            $(".erreurPseudo").fadeOut();
        }
        return valid;
    }

    // CHOIX DE LA CATEGORIE ET DE LA DIFFICULTE

    $("input:radio").on("click", function() {

        $("#titre-modal").empty();

        category = $("input:checked").attr("title");
        difficulty = $("input:checked").parent("label").text();
        categorySelect = $('input:checked').attr("name");
        levelSelect = $("input:checked").val();

        $("#modal").slideDown(500); // LE MODAL DESCEND AFIN DE RENTRER SON PSEUDO APPARAIT

        $("#titre-modal").append("Vous avez choisis la catégorie \"" + category + "\"" + " en difficulté \"" + difficulty + "\"");

        // VALIDATION DE LA DIFFICULTE ET DU PSEUDO

        $("#valider").on("click", function() {
            $("input:checked").prop("checked", false); // "DECHECK" LES RADIO

            pseudo = $("#pseudoPlayer").val();

            let reponse;
            reponse = validate($("#pseudoPlayer"), "Veuillez saisir un Pseudo", /^[A-Za-z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ]{4,}/, "Attention, au minimum 4 caractères");

            if (reponse == true) { // SI LE PSEUDO EST CONFORME
                $("#modal").slideUp(500); // LE MODAL REMONTE
                setTimeout(function() {
                    $("#titre-modal").empty(); // LE TITRE S'EFFACE AU BOUT DE 5 SEC
                }, 500);
                RecapQuizz(); // LA FONCTION RecapQuizz EST LANCER
                setTimeout(function() {
                    $("#categoryLevel").show("slide", { direction: "up" }, 300);
                    $("#windowQuizz").show("slide", { direction: "up" }, 1000); // LE RECAP DU QUIZZ S'AFFICHE PAR LE HAUT
                }, 1000);

            } else if (reponse == false) {
                $(".modal-w").effect("shake"); // SECOUE LA FENETRE MODAL
            }

        });


        // ANNULATION DE LA REQUETE

        $("#annuler").on("click", function() {
            $("#modal").slideUp(500); // REMONTE LA FENETRE MODAL
            $("input:checked").prop("checked", false); // "DECHECK" LES RADIO

            setTimeout(function() {
                $("#titre-modal").empty(); // EFFACE CE QU'IL Y A DANS LE TITRE DU MODAL APRES 0.5 SEC
                $(".erreurPseudo").fadeOut(); // CACHE L'ELEMENT ERREUR PSEUDO APRES 0.5 SEC
            }, 500);

        })

    });


    // RECAPITULATIF DU QUIZZ SELECTIONNER

    function RecapQuizz() {

        $("#categoryLevel").empty();
        $("#pseudoInfo").empty();
        $("#imageChoice").empty();
        $("#btnStartQuizz").empty();

        $("#quizz1").hide("slide", { direction: "left" }, 1000); // ANIMATION METTANT 1 SEC POUR SORTIR DE L'ECRAN
        $("#quizz2").hide("slide", { direction: "right" }, 1000); // ANIMATION METTANT 1 SEC POUR SORTIR DE L'ECRAN

        $.ajax({
            url: "quizz" + categorySelect + ".json",
            type: "GET",
            datatype: "json",

            success: function(data) {

                $("#categoryLevel").html("<h2>" + category + " - Niveau : " + difficulty + "</h2>");
                $("#pseudoInfo").html("<h3>" + pseudo + ", vous allez pouvoir démarrer ce Quizz !" + "</h3>");
                $("#imageChoice").html("<img src='./img/" + categorySelect + ".jpg' class='p-3' style='width:600px;'>");
                $("#btnStartQuizz").html("<button id='btnBegin' class='btn btn-warning'>Démarrer le Quizz</button>");

                $("#btnBegin").click(function() {
                    $("#recapQuizz").slideUp(300);
                    Quizz(); // LANCE LE QUIZZ
                    setTimeout(function() {
                        $("#jeuxQuizz").show("slide", { direction: "down" }, 300);
                    }, 300)
                })
            },

            error: function(resultat, status, erreur) {

                console.log(resultat.statusText);
                erreur = alert("Problème avec votre requête Ajax");

            }
        })

    }

    // UNE FOIS LE QUIZZ LANCER 

    function Quizz() {

        $.ajax({
            url: "quizz" + categorySelect + ".json",
            type: "GET",
            datatype: "json",

            success: function(data) {

                $("#question").append("<p>" + data.quizz[levelSelect][i].question + "</p>");
                $("#proposition1").append("<p class='proposition'>" + data.quizz[levelSelect][i].propositions[0] + "</p>");
                $("#proposition2").append("<p class='proposition'>" + data.quizz[levelSelect][i].propositions[1] + "</p>");
                $("#proposition3").append("<p class='proposition'>" + data.quizz[levelSelect][i].propositions[2] + "</p>");
                $("#proposition4").append("<p class='proposition'>" + data.quizz[levelSelect][i].propositions[3] + "</p>");
                $(".proposition").css({
                    "background-color": "coral",
                    "border": "0px solid black",
                    "width": "100%",
                    "border-radius": "15px",
                    "display": "flex",
                    "justify-content": "center"
                });
                $("#anecdote").append("<p class='anecdote' style='visibility:hidden'>" + data.quizz[levelSelect][i].anecdote + "</p>");
                $("#drop").append("Déposer votre réponse ici !");
                $("#btnNext").append("<button id='btnNextQuestion' class='btn btn-warning'>Suivant</button>");

                $(function() { // JQUERY UI DRAG AND DROP
                    $(".proposition").draggable({
                        scope: "goToRep",
                        cursor: "move",
                        snap: ".zoneReponse"
                    });
                    $(".proposition").selectable()
                    $("#drop").droppable({
                        scope: "goToRep",
                        activeClass: "active",
                        hoverClass: "hover",
                        drop: function(e, ui) {
                            $(".proposition").draggable({ disabled: true });
                            console.log(ui.draggable.text());
                            $(this).html(ui.draggable.remove().html());
                            $(this).droppable('destroy');
                            $(this)
                                .addClass("ui-state-highlight")
                                .find("p")
                                .html("");

                            // SI LA REPONSE EST BONNE
                            if (ui.draggable.text() == data.quizz[levelSelect][i].réponse) {
                                $("#drop").css({
                                    "background": "green",
                                    "width": "20%",
                                });
                                $(".anecdote").css({ visibility: "visible" });
                                $("#drop").html(data.quizz[levelSelect][i].réponse);
                                goodAnswer++
                                i++;

                                //SI LA REPONSE EST FAUSSE
                            } else {
                                $("#drop").css({
                                    "background": "red",
                                    "width": "20%",
                                });
                                $(".anecdote").css({ visibility: "visible" });
                                $("#drop").html(data.quizz[levelSelect][i].réponse);
                                i++;
                            }
                        }
                    })
                });

                // SI i N'EST PAS EGAL A 9 ON CONTINUE LES QUESTIONS
                if (i != 9) {
                    $("#btnNextQuestion").on("click", function() {
                            $("#jeuxQuizz").hide("slide", { direction: "up" }, 300);
                            setTimeout(function() {
                                $("#question").empty();
                                $("#proposition1").empty();
                                $("#proposition2").empty();
                                $("#proposition3").empty();
                                $("#proposition4").empty();
                                $("#anecdote").empty();
                                $("#drop").empty();
                                $("#drop").css({ background: "white" });
                                $("#btnNext").empty();
                                $("#jeuxQuizz").show("slide", { direction: "down" }, 300);
                                return Quizz();
                            }, 200);
                        })
                        //SINON ON EXECUTE CE CODE
                } else {

                    $("#btnNext").empty();
                    $("#btnNext").html("<button id='btnFinish' class='btn btn-warning'>Terminer</button>");

                };

                // LORSQUE QU'ON RETOURNE AU MENU

                $("#btnFinish").on("click", function() {
                    $("#jeuxQuizz").hide("slide", { direction: "up" }, 300);

                    $("#recapQuizz").show("slide", { direction: "up" }, 400);
                    $("#pseudoInfo").html("Félicitation, " + pseudo + ", tu as terminer le Quizz");
                    $("#resultat").html("<h3>Tu as eu <b style='color: green'>" + goodAnswer + "</b> sur 10, tu peux retourner dans le menu de sélection.</h3>");
                    $("#imageChoice").html("<img src='./img/" + categorySelect + ".jpg' class='p-3' style='width:600px;'>");
                    $("#btnStartQuizz").html("<button id='returnMenu' class='btn btn-warning'>Menu principal</button>");

                    $("#returnMenu").on("click", function() {
                        $("#windowQuizz").hide("slide", { direction: "up" }, 400);
                        $("#categoryLevel").empty();
                        setTimeout(function() {
                            $("#quizz1").show("slide", { direction: "right" }, 1000);
                            $("#quizz2").show("slide", { direction: "left" }, 1000);
                        }, 500);
                        setTimeout(function() {
                            // RECHARGE LE SCRIPT JS APRES 1.8 SEC
                            location.reload("js/main.js");
                        }, 1800)
                    })
                })
            },

            error: function(resultat, statut, erreur) {
                console.log(resultat.statusText);
                erreur = alert("Problème avec votre requête Ajax");
            },
        })
    }
});