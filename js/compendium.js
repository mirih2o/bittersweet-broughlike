const monsterData = [
    { name: "Tailor's Mannequin", description: "Basic enemy.", lore: "Reminds you to fit the binary.", sprite: 7 },
    { name: "Gossip Wisp", description: "Moves twice if possible.", lore: "Deadnames whispered behind your back, following everywhere.", sprite: 8 },
    { name: "Cracked Mirror", description: "Slow, acts every other turn.", lore: "Every shard says something different about who you are.", sprite: 9 },
    { name: "Old Polaroid", description: "Jumps over walls to reach targets.", lore: "Memories from your former self.", sprite: 10 },
    { name: "Uniformed Group", description: "Moves unpredictably.", lore: "Conformed society, they dress and move in unison.", sprite: 11 }
];
window.monsterData = monsterData;

const spellData = {
    ESCAPE: { name: "Escape", description: "Teleport to a random passable tile.", lore: "Sometimes your time is better spent somewhere else." },
    STOMP: { name: "Stomp", description: "Stomp all monsters, dealing 2 damage for each wall around them.", lore: "Turn society's barriers into weapons against oppression." },
    SWIRL: { name: "Swirl", description: "Teleport all monsters to random passable tiles.", lore: "A spin in your favorite dress scatters those who refuse understanding." },
    DAYBREAK: { name: "Daybreak", description: "Start the level over, keeping your spells.", lore: "Each morning brings another chance to be authentically you." },
    AURA: { name: "Aura", description: "Heal yourself for 2 HP and adjacent monsters for 1 HP.", lore: "Your pride radiates healing even to those who misgendered you." },
    DASH: { name: "Dash", description: "Dash in the direction of your last move, stunning and dealing 2 damage to enemies.", lore: "Moving forward with confidence leaving the doubters stunned." },
    UNVEIL: { name: "Unveil", description: "Remove all walls, healing yourself for 2 HP.", lore: "Coming out shatters barriers and reveals your strength." },
    GIFT: { name: "Gift", description: "Heal all monsters for 1 HP and stun them for 3 turns.", lore: "Offer understanding to those who fear your transformation." },
    LIBERATE: { name: "Liberate", description: "Destroy adjacent walls.", lore: "Break free from the labels they try to impose on you." },
    EMPOWER: { name: "Empower", description: "Gain +5 attack for the next turn.", lore: "Embracing your truth grants a power that others cannot comprehend." },
    DUPLICATE: { name: "Duplicate", description: "Duplicate your spells, filling empty slots with the previous spell.", lore: "The girl in the mirror isn't a reflection—she's finally you." },
    BRAVERY: { name: "Bravery", description: "Gain a shield that absorbs 2 damage and stun all monsters.", lore: "The courage to be your authentic self creates an armor nothing can pierce." },
    FOCUS: { name: "Focus", description: "Shoot a bolt in the direction of your last move, dealing 4 damage.", lore: "Directing energy toward your future, not your assigned past." },
    CROSS: { name: "Cross", description: "Shoot bolts in cardinal directions, dealing 2 damage each.", lore: "Your identity blazes outward, undeniable in all directions." },
    X: { name: "X", description: "Shoot bolts in diagonal directions, dealing 3 damage each.", lore: "Chromosomes are just letters, not your destiny's author." }
};
window.spellData = spellData;

const diaryData = `I keep thinking that if I dress the way I feel inside, the rest might follow. That the shape of my outside could teach my heart not to flinch.
But the moment I step out, the stares, the silence, the second-guessing, it all comes back. Like I’m wearing something forbidden. Like I’m asking too much, even when I barely speak.
It’s strange how a ribbon can feel like a rebellion. Or how styling my hair feels like taking back a little piece of myself.
Some days, I wonder what they see when they look at me. Other days, I try not to care.
Today, I went out anyway. That counts for something.
Tomorrow, maybe I’ll walk a little taller.
`;
window.diaryData = diaryData;

function toggleCompendium() {
  const modal = document.getElementById("compendiumModal");
  const symbol = document.getElementById("compendium-toggle-symbol");
  if (modal.classList.contains("visible")) {
    modal.classList.remove("visible");  
    if (symbol) symbol.textContent = "▼";
  } else {
    showCompendium();
    modal.classList.add("visible");
    if (symbol) symbol.textContent = "►";
  }
}

function showCompendium() {
  html = "<h2>Diary</h2><div class=\"compendium-card compendium-diary-card\">";
  html += `<div class="compendium-diary-title">Dear Diary</div>`;
  html += `<div class="compendium-diary-content">${window.diaryData.split('\n').map(paragraph => 
  paragraph.trim() ? `<p>${paragraph}</p>` : ''
).join('')}</div>`;
html += "</div>";

  html += `<h2>Monsters</h2><ul class="compendium-list">`;
  window.monsterData.forEach(monster => {
    html += `
      <li class="compendium-card">
        <div class="compendium-monster-name">${monster.name}</div>
        <div class="compendium-monster-row">
          <span class="compendium-image" style="background-position:-${monster.sprite * 16}px 0;"></span>
          <div class="compendium-monster-texts">
            <div class="compendium-monster-desc">${monster.description}</div>
            <div class="compendium-monster-lore">"${monster.lore}"</div>
          </div>
        </div>
      </li>
    `;
  });
  html += "</ul>";

  html += "<h2>Spells</h2><ul class=\"compendium-list\">";
  Object.values(window.spellData).forEach(spell => {
    html += `
    <li class="compendium-card compendium-spell-card">
      <div class="compendium-spell-name">${spell.name}</div>
      <div class="compendium-spell-desc">${spell.description}</div>
      <div class="compendium-spell-lore">"${spell.lore}"</div>
    </li>
  `;
  });
  html += "</ul>";

  document.getElementById("compendiumContent").innerHTML = html;
}

const compendiumBtn = document.getElementById("openCompendium");
if (compendiumBtn) {
  compendiumBtn.onclick = toggleCompendium;
}