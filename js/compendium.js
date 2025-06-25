const monsterData = [
    { name: "Tailor's Mannequin", description: "Basic enemy.", sprite: 7 },
    { name: "Gossip Wisp", description: "Moves twice if possible.", sprite: 8 },
    { name: "Cracked Mirror", description: "Slow, acts every other turn.", sprite: 9 },
    { name: "Spider", description: "Consumes walls and grows.", sprite: 10 },
    { name: "Uniformed Group", description: "Moves unpredictably.", sprite: 11 }
];
window.monsterData = monsterData;

const spellData = {
    ESCAPE: { name: "Escape", description: "Teleport to a random passable tile.",},
    STOMP: { name: "Stomp", description: "Stomp all monsters, dealing 2 damage for each wall around them."},
    SWIRL: { name: "Swirl", description: "Teleport all monsters to random passable tiles."},
    DAYBREAK: { name: "Daybreak", description: "Start the level over, keeping your spells."},
    AURA: { name: "Aura", description: "Heal yourself and adjacent monsters for 1 HP."},
    DASH: { name: "Dash", description: "Dash in the direction of your last move, stunning and dealing 2 damage to enemies."},
    UNVEIL: { name: "Unveil", description: "Remove all walls, healing yourself for 2 HP."},
    GIFT: { name: "Gift", description: "Heal all monsters for 1 HP and give them treasure."},
    REFINE: { name: "Refine", description: "Turn adjacent walls into treasure."},
    EMPOWER: { name: "Empower", description: "Gain +5 attack for the next turn."},
    DUPLICATE: { name: "Duplicate", description: "Duplicate your spells, filling empty slots with the previous spell."},
    BRAVERY: { name: "Bravery", description: "Gain a shield that absorbs 2 damage and stun all monsters."},
    FOCUS: { name: "Focus", description: "Shoot a bolt in the direction of your last move, dealing 2 damage."},
    CROSS: { name: "Cross", description: "Shoot bolts in cardinal directions, dealing 2 damage each."},
    X: { name: "X", description: "Shoot bolts diagonally in diagonal directions, dealing 3 damage each."}
};
window.spellData = spellData;

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
  let html = `<h2>Monsters</h2><ul class="compendium-list">`;
  window.monsterData.forEach(monster => {
    html += `
      <li class="compendium-card">
        <div class="compendium-monster-name">${monster.name}</div>
        <div class="compendium-monster-row">
          <span class="compendium-image" style="background-position:-${monster.sprite * 16}px 0;"></span>
          <div class="compendium-monster-texts">
            <div class="compendium-monster-desc">${monster.description}</div>
            <div class="compendium-monster-lore">"Lore Text"</div>
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
      <div class="compendium-spell-lore">"Lore Text"</div>
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