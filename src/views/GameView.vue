<template>
    <div>
    <ResponsiveNav
    :uiLabels="uiLabels"
    :gamePin="gamePin"
    :userName="userName"
    :gameActive="true"
    :game
    />
    
     <button
        v-if="isAdmin && activeGame != ''"
        class="menu-button"
        @click="goBackToMenu()">{{ uiLabels.GameView.exitGame }}
    </button> 


    <!--Game Components-->
    <div v-if="activeGame"> 
        <GeneralQuizComponent
            v-if="activeGame === 'generalQuiz'"
            :gameData="gameData"
            :gamePin="gamePin"x
            :uiLabels="uiLabels"
            :isAdmin="isAdmin"
            :userName="userName"
            :isPlaying="isPlaying"
            @gameCompleted="onGameCompleted"
        />
        <ThisOrThatComponent 
            v-if="activeGame === 'thisOrThat' && isPlaying" 
            :socket="socket"
            :lang="lang"
            :gameData="gameData" 
            :gamePin="gamePin" 
            :uiLabels="uiLabels"
            :userName="userName"
            @gameCompleted="onGameCompleted"
        />

        <WhosMostLikelyToComponent  
            v-if="activeGame === 'whosMostLikelyTo'"
            :gameData="gameData"
            :gamePin="gamePin"
            :uiLabels="uiLabels"
            :userName="userName"
            :isAdmin="isAdmin" 
            :isPlaying="isPlaying"
            @gameCompleted="onGameCompleted"
            />
    </div>

    
    
    <div v-if="!activeGame">
       <div class="button-container">


           <div v-if="this.isAdmin">
               <div v-for="gameName in gameData.selectedGames"
                   :key="gameName"
                   >
               <button
               v-if="!playedGames.includes(gameName)"
               class="button orange"
                   @click="playMiniGame(gameName)"
                   >
                       <p class="small-text">{{ gameName }}</p>
               </button></div>




           </div>
       </div>
   </div>
   <ScoreBoardComponent 
        :participants="gameData.participants"
        :uiLabels="uiLabels"
    />
</div>
</template>

<script>
    import io from 'socket.io-client';
    import GeneralQuizComponent from '../components/GeneralQuizComponent.vue';
    import ThisOrThatComponent from '../components/ThisOrThatComponent.vue';
    import WhosMostLikelyToComponent from '../components/WhosMostLikelyToComponent.vue';
    import ResponsiveNav from '../components/ResponsiveNav.vue';
    import ScoreBoardComponent from '../components/ScoreBoardComponent.vue';
    

    export default{
        name: 'GameView',
        components: {
            GeneralQuizComponent,
            ThisOrThatComponent,
            ResponsiveNav,
            ScoreBoardComponent,
            WhosMostLikelyToComponent
        },
        data: function(){
            return {
                socket:null,
                lang: localStorage.getItem("lang") || "en",
                gamePin: '',
                userName: '',
                gameData: {},
                activeGame: '',
                uiLabels: {},
                playedGames: [],
                isAdmin: false,
                isPlaying: true

            }
        },
        created: function() {
            // this.socket = io("localhost:3000"); // TODO: Fråga micke vilket sätt är bäst att instansiera ny socket?
            sessionStorage.setItem("dataServer", "");
            this.socket = io(sessionStorage.getItem("dateServer"));

            this.socket.on( "uiLabels", labels => this.uiLabels = labels );
            this.socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                this.determineAdminStatus();
            });
            this.setup();
            this.socket.emit('joinSocketRoom', this.gamePin);
            this.socket.emit( "getUILabels", this.lang );

            
        },
        mounted: function() {
            this.socket.on("onGameStart", gameName=> this.activeGame = gameName);
            this.socket.on("participantsUpdate", participants => this.gameData.participants = participants)
            this.socket.emit('updateAllGameData', this.gamePin);
            console.log("Sent 'updateAllGameData' to gamePin: ", this.gamePin);
            window.addEventListener("beforeunload", this.handleWindowClose);
        },
        methods: {
            setup: function(){
                this.gamePin = this.$route.params.gamePin;
                this.userName = sessionStorage.getItem('userName');
                this.socket.emit('requestGameData', this.gamePin);
            },
            goBackToMenu(){
                this.playedGames.push(this.activeGame);
                this.activeGame ='';
                this.socket.emit("startMiniGame", {
                    gameName: '',
                    gamePin: this.gamePin
                }

                )
            },

            handleLanguageChange(newLang) {
                this.lang = newLang;
                sessionStorage.setItem("lang", newLang);
                socket.emit("getUILabels", this.lang);
            },

            determineAdminStatus () {
                const user = this.gameData.participants?.find(p=> p.name === this.userName) // används user? /sebbe
                this.isAdmin = sessionStorage.getItem("isAdmin") === "true" || false;
                // If admin, and a userName exists in sessionStorage, the admin is playing.
                if(this.isAdmin) this.isPlaying = sessionStorage.getItem("userName") !== null; 
                console.log("Davids Log: Admin status: ", this.isAdmin);
            },

            playMiniGame: function(game){
                console.log("playMiniGame with this.activeGame =", this.activeGame, " and this.isAdmin = ", this.isAdmin)
                if(this.isAdmin){
                    this.socket.emit("startMiniGame", {
                        gameName: game, 
                        gamePin: this.gamePin
                })}
            },
            onGameCompleted() {
                console.log("spelet som är spelat är ", this.activeGame);
               this.playedGames.push(this.activeGame);
               console.log("spelet som är playedGames är ", this.playedGames);
               this.activeGame = '';
            },
            // Delete user on window close / refresh
            handleWindowClose(event) {
            console.log("Window closed!!! Deleting user")
            this.socket.emit('deleteUser', this.gamePin, this.userName);
            },
        },
        beforeDestroy() {
            console.log("->GameView -> beforeDestroy");
            window.removeEventListener("beforeunload", this.handleWindowClose);
            // this.dismantleSocket();
        },
    }

</script>

<style>


.button-container div {
  display: flex;
  gap: 10px; 
  flex-wrap: wrap; 
  justify-content: center; 
  margin-top: 50px;
}

.button-container button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.menu-button {
  position: fixed;
  top: 85%; /* Avstånd från toppen */
  left: 10px; /* Avstånd från vänster */
  background-color: #d32f2f; /* Röd bakgrundsfärg */
  color: white; /* Vit text */
  border: none; /* Ingen kant */
  border-radius: 5px; /* Rundade hörn */
  padding: 15px 20px; /* Inre marginal */
  font-size: 1rem; /* Textstorlek */
  font-weight: bold; /* Fet stil */
  cursor: pointer; /* Pekare på hover */
  z-index: 1000; /* Hög prioritet för placering */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Skugga för djup */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Animationseffekt */
  
}

.menu-button:hover {
  background-color: #b71c1c; /* Mörkare röd vid hover */
  transform: scale(1.05); /* Lätt förstoring vid hover */
}


</style>