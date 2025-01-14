<template>
  <div class="scoreboard-container">
    <h2>{{ uiLabels.GameView.scoreboard }}</h2>
    <transition-group name="fade" tag="ul" class="scoreboard">
      <li
        v-for="participant in sortedParticipants"
        :key="participant.name"
        class="scoreboard-item"
        :class="{ 'highlight': participant.highlighted }"
      >
        <span class="player-name">{{ participant.name }}</span>
        <span class="player-score">{{ participant.totalScore }}</span>
      </li>
    </transition-group>
  </div>
</template>

  
  <script>
  export default {
    name: "ScoreBoardComponent",
    props: {
      participants: {
        type: Array,
        required: true,
      },
      uiLabels: {
        type: Object
      }
    },
    data() {
        return {
            participantsWithHighlight: this.participants.map(participant => ({
            ...participant,
            highlighted: false,
            })),
        };
    },
    computed: {
      sortedParticipants() {
        // Calculate total score and sort participants in descending order
        return this.participants
          .map((participant) => ({
            ...participant,
            totalScore:
              participant.scoreGame1 +
              participant.scoreGame2 +
              participant.scoreGame3
          }))
          .sort((a, b) => b.totalScore - a.totalScore);
      },
    },
  };
  </script>
  <style scoped>
  /* Scoreboard container styling */
.scoreboard-container {
    color:white;
  max-width: 400px;
  margin: 20px auto;
  text-align: center;
  font-family: 'Arial', sans-serif;
  background-color: #1d3557;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Scoreboard list styling with scrolling */
.scoreboard {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 300px; /* Adjust this to control the number of visible players (e.g., ~4 players) */
  overflow-y: auto; /* Enable vertical scrolling */
  scrollbar-width: thin; /* For modern browsers, makes the scrollbar less intrusive */
  scrollbar-color: #457b9d #1d3557; /* Colors for the scrollbar (optional) */
}

/* Optional scrollbar styling for Webkit browsers (Chrome, Safari, Edge) */
.scoreboard::-webkit-scrollbar {
  width: 6px; /* Width of the scrollbar */
}

.scoreboard::-webkit-scrollbar-thumb {
  background-color: #457b9d; /* Color of the scrollbar thumb */
  border-radius: 3px; /* Rounded edges for the scrollbar thumb */
}

.scoreboard::-webkit-scrollbar-track {
  background-color: #1d3557; /* Background of the scrollbar track */
}

/* Scoreboard item styling */
.scoreboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #457b9d;
  border-radius: 5px;
  margin-bottom: 10px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Add hover effects */
.scoreboard-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
  </style>
  