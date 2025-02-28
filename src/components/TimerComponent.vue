<template>
    <div class="timer-container">
      <!-- Timer -->
      <div 
        id="timer" 
        class="timer" 
        :class="{'flashing': isFlashing}"
      >
        {{ minutes }}:{{ seconds }}
      </div>
  
      <!-- Mute Button -->
      <button @click="toggleMute" class="mute-button">
        <i :class="muted ? 'icon-muted' : 'icon-unmuted'"></i>
      </button>
    </div>
  </template>
  
  <script>
      
  import io from 'socket.io-client';
  sessionStorage.setItem("dataServer", "");
  const socket = io(sessionStorage.getItem("dataServer"));
  //const socket = io("localhost:3000");

 
  
  export default {
    props: {
      gamePin: {
        type: String,
        required: true
      }
    },
    data: function() {
      return {
        remainingTime: 3600, // 60 minutes default
        localTimer: null,
        syncInterval: null,
        muted: false,
        isFlashing: false, // Used to trigger flashing effect
      };
    },
    computed: {
      minutes() {
        return Math.floor(this.remainingTime / 60);
      },
      seconds() {
        const seconds = this.remainingTime % 60;
        return seconds < 10 ? `0${seconds}` : `${seconds}`; // Ensure 2 digits
      }
    },
    methods: {
      start() {
        this.localTimer = setInterval(() => {
          if (this.remainingTime > 0) {
            this.remainingTime--;
          }
          if (this.remainingTime % 60 === 0) this.ringBell();
        }, 1000);
  
        this.syncInterval = setInterval(this.syncWithServer, 10000); // Request sync with server every 10 seconds.
      },
      syncWithServer() {
        socket.emit('requestGameTime', this.gamePin, (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            this.remainingTime = response.remainingTime;
          }
        });
      },
      ringBell() {
        this.isFlashing = true; // Start flashing
        if(!this.muted){
            console.error("Playing alarm!!! this.muted = ", this.muted);
            const bell = new Audio('/audio/alarm.mp3');
            bell.play().catch((error) => {
            console.error("Could not play alarm:", error);
            });
        }
        setTimeout(() => {
          this.isFlashing = false; // Stop flashing after 1 second
        }, 2000);
      },
      toggleMute() {
        this.muted = !this.muted;
        console.log("toggleMute -> this.muted = ", this.muted)
      }
    },
    mounted() {
      this.syncWithServer();
      this.start();
    },
    beforeUnmount() {
      clearInterval(this.localTimer);
      clearInterval(this.syncInterval);
    },
    unmounted() {
        // Disconnect socket when component is destroyed or view is changed
        if (this.socket) {
            this.socket.emit('leaveSocketRoom', this.gamePin); // Leave the room
            this.socket.disconnect(); // Disconnect the socket
            this.socket = null;
        }
    }
  };
  </script>
  
  <style scoped>
  /* Timer Container Styling */
  .timer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 20px;
  }
  
  /* Timer Styling */
  .timer {
    font-size: 2.2rem; 
    font-family: 'Roboto', 'Arial', sans-serif; 
    font-weight: bold;
    color: #1d3557; 
    background-color: transparent;
    text-shadow: none; 
    margin-right: 0; 
    padding: 10px 20px;
    border-radius: 10px;
    transition: color 0.3s ease; 
  }
  
  /* Flashing Timer Styling */
  .timer.flashing {
    color: red; 
    animation: flash 2s infinite; 
  }
  
  @keyframes flash {
    0% {
        color: #1d3557;
    }
    20% {
        color: red
    }
    40% {
        color: #1d3557;
    }
    60% {
        color: red;
    }
    100% {
        color: #1d3557;
    }
  }
  
  /* Mute Button Styling */
  .mute-button {
    background-color: transparent; 
    border: none;
    cursor: pointer;
    font-size: 24px; 
    padding: 12px;
    border-radius: 50%; 
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out; 
    margin-left: 0; 
  }
  
  /* Mute Button Hover Effect (removed background) */
  .mute-button:hover {
    transform: scale(1.1); 
  }
  
  /* Speaker icon (unmuted) */
  .icon-unmuted::before {
    content: "\f028"; 
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    color: #1d3557; 
  }
  
  /* Speaker icon with a line (muted) */
  .icon-muted::before {
    content: "\f6a9"; 
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    color: #1d3557; 
  }
  </style>
  
