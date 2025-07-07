import './style.css'

interface CharacterData {
	race?: string;
	name?: string;
	stats: {
		strength: { value: number; bonus: number };
		agility: { value: number; bonus: number };
		intelligence: { value: number; bonus: number };
	};
	endurance: number;
	damageTaken: number;
	skills: {
		meleeOB: number;
		missileOB: number;
		db: number;
		running: number;
		general: number;
		trickery: number;
		perception: number;
		magical: number;
	};
	racialBonuses: {
		melee?: number;
		missile?: number;
		db?: number;
		running?: number;
		general?: number;
		trickery?: number;
		perception?: number;
		magical?: number;
	};
	equipment: string[];
	worn: {
		armor: string;
		cloak: string;
		dagger: string;
		belt: string;
	};
	specialItems: string;
	time: string;
	days: string;
	experiencePoints: string;
	selectedSpells: string[];
	restrictedSpells: string[];
}

class CharacterSheet {
	private data: CharacterData;

	constructor() {
		this.data = {
			stats: {
				strength: {value: 0, bonus: 0},
				agility: {value: 0, bonus: 0},
				intelligence: {value: 0, bonus: 0}
			},
			endurance: 20,
			damageTaken: 0,
			skills: {
				meleeOB: 0,
				missileOB: 0,
				db: 0,
				running: 0,
				general: 0,
				trickery: 0,
				perception: 0,
				magical: 0
			},
			racialBonuses: {},
			equipment: new Array(12).fill(''),
			worn: {
				armor: '',
				cloak: '',
				dagger: '',
				belt: ''
			},
			specialItems: '',
			time: '',
			days: '',
			experiencePoints: '',
			selectedSpells: new Array(8).fill(''),
			restrictedSpells: []
		};

		this.initializeSpellDropdowns();
		this.initializeEventListeners();
		this.initializeCharacterManagement();
		this.loadSavedCharactersList();
	}

	private getSpellList(): Array<{ id: number, name: string, description: string }> {
		return [
			{
				id: 1,
				name: "Item Analysis",
				description: "Item Analysis (3): When indicated by the text, you may cast this spell and \"analyze\" an item (follow the directions given in the text)."
			},
			{
				id: 2,
				name: "Balance",
				description: "Balance (2): Increases your General bonus by +2 for one activity to be attempted at the current text location."
			},
			{
				id: 3,
				name: "Calm",
				description: "Calm (5): May only be cast against one animal or normal being at a time (Man, Elf, Dwarf, Hobbit, Orc, Troll, etc.). Pick a number and add your Magical bonus. If the result is more than 7, the foe is \"calmed\" and will not attack unless hurt or attempt to steal from him. Otherwise, the encounter proceeds normally."
			},
			{
				id: 4,
				name: "Camouflage",
				description: "Camouflage (3): For the purposes of one action, this spell increases your Trickery bonus by +2."
			},
			{
				id: 5,
				name: "Charm Animal",
				description: "Charm Animal (6): You may cast this spell against any hostile normal \"animal\" (bear, wolf, snake, etc.). The animal will follow you (record its OB, DB, and Endurance) and will fight any foe you desire it to. After it has fought once (one \"fight\") for you, the animal will leave. You may only have one animal \"charmed\" at a time."
			},
			{
				id: 6,
				name: "Clairvoyance",
				description: "Clairvoyance (5): When given a choice of two or more text sections to read, you may read two of them and then proceed to whichever one you want."
			},
			{
				id: 7,
				name: "Fire Bolt",
				description: "Fire Bolt (6): This spell may be used during combat when you would normally make a missile attack. Pick a number twice and add the two results plus double your Magical bonus; this result is the amount of damage taken by your opponent."
			},
			{
				id: 8,
				name: "Healing",
				description: "Healing (0): Reduces the amount of time required to heal 3 points of damage from 60 minutes to 20 minutes. Using this spell and then resting for a \"night\" heals all damage."
			},
			{
				id: 9,
				name: "Luck",
				description: "Luck (5): When you cast this spell just after you have picked a number, you may ignore the number picked and pick a number again."
			},
			{
				id: 10,
				name: "Protection from Magic",
				description: "Protection from Magic (4): When the text indicates that an opponent is casting a spell, you may cast this spell. The number picked to resolve the spell will be decreased by your Magical bonus."
			},
			{
				id: 11,
				name: "Shield",
				description: "Shield (4): If cast at the beginning of a fight, this spell will increase your DB by +2. It may not be used if a normal shield is being used."
			},
			{
				id: 12,
				name: "Speed",
				description: "Speed (3): This spell may be cast whenever you attempt to Run Away or Run Past. Your Running bonus is increased by +2 for such attempts."
			},
			{
				id: 13,
				name: "Strength",
				description: "Strength (6): When cast at the beginning of a fight, this spell doubles the damage you give with melee attacks for the remainder of the fight."
			},
			{
				id: 14,
				name: "Sustain Self",
				description: "Sustain Self (2): When cast, this spell has the same effect as eating a meal."
			},
			{
				id: 15,
				name: "Telekinesis",
				description: "Telekinesis (5): You may cast this spell when faced with an opponent who is unaware of you. Make a Steal & Take action (see Action Table), adding your Magical bonus rather than your Trickery bonus. If you are unsuccessful (a result of 8 or less), your opponent is aware of you and you must take an action."
			}
		];
	}

	private getRaceDescriptions(): Record<string, string> {
		return {
			man: '<strong>Man:</strong> Increase your <em>General</em> bonus by 1.',
			elf: '<strong>Elf:</strong> When underground, decrease your <em>Perception</em> by 1 and your <em>Magical</em> bonus by 1. When outdoors, increase your <em>Perception</em> by 1 and your <em>Magical</em> bonus by 1. Ignore disadvantages #1, #2, and #3 under the "Moving at Night" rules.',
			dwarf: '<strong>Dwarf:</strong> When underground, increase your <em>Perception</em> bonus by 1 and your <em>General</em> bonus by 1. Decrease your <em>Running</em> bonus by 1. Ignore disadvantage #1 and #3 under the "Moving at Night" rules. Dwarves may not "learn" spells #7, #11, and #15.',
			hobbit: '<strong>Hobbit:</strong> Increase your <em>Trickery</em> bonus by 2. Decrease your <em>Melee OB</em> by 2. Ignore disadvantage #1 and #3 under the "Moving at Night" rules. Hobbits may not "learn" spells #3, #5, #7, #11, and #15.'
		};
	}

	private initializeEventListeners(): void {
		document.addEventListener('DOMContentLoaded', () => {
			const raceSelect = document.getElementById('race-select') as HTMLSelectElement;
			if (raceSelect) {
				raceSelect.addEventListener('change', (e) => {
					this.data.race = (e.target as HTMLSelectElement).value;
					this.applyRacialBonuses();
					this.updateSpellRestrictions();
					this.updateRaceDescription();
				});
			}

			const strengthValue = document.getElementById('strength-value') as HTMLInputElement;
			if (strengthValue) {
				strengthValue.addEventListener('input', (e) => {
					this.data.stats.strength.value = parseInt((e.target as HTMLInputElement).value) || 0;
					this.calculateEndurance();
					this.updateSkillBonuses();
				});
			}

			const agilityValue = document.getElementById('agility-value') as HTMLInputElement;
			if (agilityValue) {
				agilityValue.addEventListener('input', (e) => {
					this.data.stats.agility.value = parseInt((e.target as HTMLInputElement).value) || 0;
					this.updateSkillBonuses();
				});
			}

			const intelligenceValue = document.getElementById('intelligence-value') as HTMLInputElement;
			if (intelligenceValue) {
				intelligenceValue.addEventListener('input', (e) => {
					this.data.stats.intelligence.value = parseInt((e.target as HTMLInputElement).value) || 0;
					this.updateSkillBonuses();
				});
			}

			document.querySelectorAll('.stat-input').forEach(input => {
				input.addEventListener('input', () => {
					this.updateStatBonuses();
				});
			});

			document.querySelectorAll('.skill-bonus, .skill-equipment, .skill-special').forEach(input => {
				input.addEventListener('input', () => {
					this.calculateSkillTotals();
				});
			});
		});
	}

	private applyRacialBonuses(): void {
		this.data.racialBonuses = {};

		switch (this.data.race) {
			case 'man':
				this.data.racialBonuses.general = 1;
				break;
			case 'elf':
				this.data.racialBonuses.perception = 1;
				this.data.racialBonuses.magical = 1;
				break;
			case 'dwarf':
				this.data.racialBonuses.perception = 1;
				this.data.racialBonuses.general = 1;
				this.data.racialBonuses.running = -1;
				break;
			case 'hobbit':
				this.data.racialBonuses.trickery = 2;
				this.data.racialBonuses.melee = -2;
				break;
		}

		this.updateRacialBonusDisplay();
		this.calculateSkillTotals();
	}

	private updateSpellRestrictions(): void {
		this.data.restrictedSpells = [];

		switch (this.data.race) {
			case 'dwarf':
				this.data.restrictedSpells = ['Fire Bolt', 'Shield', 'Telekinesis'];
				break;
			case 'hobbit':
				this.data.restrictedSpells = ['Calm', 'Charm Animal', 'Fire Bolt', 'Shield', 'Telekinesis'];
				break;
		}

		this.updateSpellDropdowns();
	}

	private updateRacialBonusDisplay(): void {
		const skillRows = document.querySelectorAll('.skills-table tbody tr');
		const skillNames = ['melee', 'missile', 'db', 'running', 'general', 'trickery', 'perception', 'magical'];

		skillRows.forEach((row, index) => {
			if (index < skillNames.length) {
				const skillName = skillNames[index];
				const specialInput = row.querySelector('.skill-special') as HTMLInputElement;
				if (specialInput && skillName) {
					const bonus = this.data.racialBonuses[skillName as keyof typeof this.data.racialBonuses] || 0;
					specialInput.value = bonus !== 0 ? bonus.toString() : '';
				}
			}
		});
	}

	private initializeSpellDropdowns(): void {
		document.addEventListener('DOMContentLoaded', () => {
			this.updateSpellDropdowns();
		});
	}

	private updateSpellDropdowns(): void {
		const spellSelects = document.querySelectorAll('.spell-select');
		const spells = this.getSpellList();

		spellSelects.forEach((select) => {
			const selectElement = select as HTMLSelectElement;
			const currentValue = selectElement.value;

			selectElement.innerHTML = '';
			const emptyOption = document.createElement('option');
			emptyOption.value = '';
			emptyOption.textContent = '-- Select Spell --';
			selectElement.appendChild(emptyOption);

			spells.forEach(spell => {
				const option = document.createElement('option');
				option.value = spell.name;
				option.textContent = `${spell.id}. ${spell.name}`;
				option.title = spell.description;

				if (this.data.restrictedSpells.includes(spell.name)) {
					option.disabled = true;
					option.textContent += ' (Not available for your race)';
				}

				selectElement.appendChild(option);
			});

			if (currentValue && !this.data.restrictedSpells.includes(currentValue)) {
				selectElement.value = currentValue;
			} else if (currentValue && this.data.restrictedSpells.includes(currentValue)) {
				selectElement.value = '';
			}
		});
	}

	private calculateEndurance(): void {
		const endurance = 20 + (2 * this.data.stats.strength.value);
		this.data.endurance = endurance;
		const enduranceInput = document.getElementById('endurance') as HTMLInputElement;
		if (enduranceInput) {
			enduranceInput.value = endurance.toString();
		}
	}

	private updateStatBonuses(): void {
		const calculateBonus = (value: number): number => {
			if (value >= 11) {
				return 2;
			}
			if (value >= 9) {
				return 1;
			}
			if (value >= 5) {
				return 0;
			}
			if (value >= 2) {
				return -1;
			}
			return -2;
		};

		const strengthBonus = document.getElementById('strength-bonus') as HTMLInputElement;
		const agilityBonus = document.getElementById('agility-bonus') as HTMLInputElement;
		const intelligenceBonus = document.getElementById('intelligence-bonus') as HTMLInputElement;

		if (strengthBonus) {
			const bonus = calculateBonus(this.data.stats.strength.value);
			strengthBonus.value = bonus.toString();
			this.data.stats.strength.bonus = bonus;
		}

		if (agilityBonus) {
			const bonus = calculateBonus(this.data.stats.agility.value);
			agilityBonus.value = bonus.toString();
			this.data.stats.agility.bonus = bonus;
		}

		if (intelligenceBonus) {
			const bonus = calculateBonus(this.data.stats.intelligence.value);
			intelligenceBonus.value = bonus.toString();
			this.data.stats.intelligence.bonus = bonus;
		}

		this.calculateSkillTotals();
	}

	private updateSkillBonuses(): void {
		const skillRows = document.querySelectorAll('.skills-table tbody tr');

		const meleeRow = skillRows[0];
		if (meleeRow) {
			const statCell = meleeRow.children[5];
			if (statCell) {
				statCell.textContent = `${this.data.stats.strength.bonus}St`;
			}
		}

		[1, 2, 3].forEach(index => {
			const row = skillRows[index];
			if (row) {
				const statCell = row.children[5];
				if (statCell) {
					statCell.textContent = `${this.data.stats.agility.bonus}Ag`;
				}
			}
		});

		const generalRow = skillRows[4];
		if (generalRow) {
			const statCell = generalRow.children[5];
			if (statCell) {
				statCell.textContent = `${this.data.stats.agility.bonus}Ag`;
			}
		}

		[5, 6, 7].forEach(index => {
			const row = skillRows[index];
			if (row) {
				const statCell = row.children[5];
				if (statCell) {
					statCell.textContent = `${this.data.stats.intelligence.bonus}In`;
				}
			}
		});

		this.calculateSkillTotals();
	}

	private calculateSkillTotals(): void {
		const skillRows = document.querySelectorAll('.skills-table tbody tr');
		const skillNames = ['melee', 'missile', 'db', 'running', 'general', 'trickery', 'perception', 'magical'];

		skillRows.forEach((row, index) => {
			if (index < skillNames.length) {
				const totalInput = row.querySelector('.skill-total') as HTMLInputElement;
				const skillBonusInput = row.querySelector('.skill-bonus') as HTMLInputElement;
				const equipmentBonusInput = row.querySelector('.skill-equipment') as HTMLInputElement;
				const specialBonusInput = row.querySelector('.skill-special') as HTMLInputElement;

				if (totalInput) {
					const skillBonus = parseInt(skillBonusInput?.value || '0') || 0;

					let statBonus = 0;
					const skillName = skillNames[index];
					if (skillName === 'melee') {
						statBonus = this.data.stats.strength.bonus;
					} else if (['missile', 'db', 'running', 'general'].includes(skillName)) {
						statBonus = this.data.stats.agility.bonus;
					} else if (['trickery', 'perception', 'magical'].includes(skillName)) {
						statBonus = this.data.stats.intelligence.bonus;
					}

					const equipmentBonus = parseInt(equipmentBonusInput?.value || '0') || 0;
					const specialBonus = parseInt(specialBonusInput?.value || '0') || 0;
					const total = skillBonus + statBonus + equipmentBonus + specialBonus;
					const hasSkillInput = skillBonusInput?.value?.trim() !== '';
					const hasEquipmentInput = equipmentBonusInput?.value?.trim() !== '';
					const hasSpecialInput = specialBonusInput?.value?.trim() !== '';
					const hasStatValue = this.data.stats.strength.value > 0 || this.data.stats.agility.value > 0 || this.data.stats.intelligence.value > 0;

					if (hasSkillInput || hasEquipmentInput || hasSpecialInput || hasStatValue || total !== 0) {
						totalInput.value = total.toString();
					} else {
						totalInput.value = '';
					}
				}
			}
		});
	}

	private updateRaceDescription(): void {
		const descriptionElement = document.getElementById('race-description');
		if (!descriptionElement) {
			return;
		}

		const descriptions = this.getRaceDescriptions();

		if (this.data.race && descriptions[this.data.race]) {
			descriptionElement.innerHTML = descriptions[this.data.race];
			descriptionElement.classList.add('show');
		} else {
			descriptionElement.innerHTML = '';
			descriptionElement.classList.remove('show');
		}
	}

	private initializeCharacterManagement(): void {
		document.addEventListener('DOMContentLoaded', () => {
			const saveBtn = document.getElementById('save-character');
			if (saveBtn) {
				saveBtn.addEventListener('click', () => {
					this.saveCharacter();
				});
			}

			const clearBtn = document.getElementById('clear-character');
			if (clearBtn) {
				clearBtn.addEventListener('click', () => {
					this.clearCharacter();
				});
			}
		});
	}

	private saveCharacter(): void {
		const characterNameInput = document.getElementById('character-name') as HTMLInputElement;
		const characterName = characterNameInput?.value?.trim();

		if (!characterName) {
			alert('Please enter a character name in the character sheet before saving.');
			return;
		}

		const characterData = this.collectFormData();
		const savedCharacters = this.getSavedCharacters();
		const existingIndex = savedCharacters.findIndex(char => char.name === characterName);
		if (existingIndex >= 0) {
			if (!confirm(`A character named "${characterName}" already exists. Do you want to overwrite it?`)) {
				return;
			}
			savedCharacters[existingIndex] = characterData;
		} else {
			savedCharacters.push(characterData);
		}

		localStorage.setItem('tolkien-quest-characters', JSON.stringify(savedCharacters));
		this.loadSavedCharactersList();

		alert(`Character "${characterName}" saved successfully!`);
	}

	private clearCharacter(): void {
		if (!confirm('Are you sure you want to clear all character data? This cannot be undone.')) {
			return;
		}

		const inputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
		inputs.forEach(input => {
			if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
				input.value = '';
			}
		});

		this.data = {
			stats: {
				strength: {value: 0, bonus: 0},
				agility: {value: 0, bonus: 0},
				intelligence: {value: 0, bonus: 0}
			},
			endurance: 20,
			damageTaken: 0,
			skills: {
				meleeOB: 0,
				missileOB: 0,
				db: 0,
				running: 0,
				general: 0,
				trickery: 0,
				perception: 0,
				magical: 0
			},
			racialBonuses: {},
			equipment: new Array(12).fill(''),
			worn: {
				armor: '',
				cloak: '',
				dagger: '',
				belt: ''
			},
			specialItems: '',
			time: '',
			days: '',
			experiencePoints: '',
			selectedSpells: new Array(8).fill(''),
			restrictedSpells: []
		};

		this.updateRaceDescription();
		this.calculateEndurance();
		this.updateSkillBonuses();
		this.updateSpellDropdowns();
	}

	private loadCharacter(characterData: CharacterData): void {
		const nameInput = document.getElementById('character-name') as HTMLInputElement;
		const raceSelect = document.getElementById('race-select') as HTMLSelectElement;

		if (nameInput && characterData.name) {
			nameInput.value = characterData.name;
		}
		if (raceSelect && characterData.race) {
			raceSelect.value = characterData.race;
		}

		const strengthValue = document.getElementById('strength-value') as HTMLInputElement;
		const agilityValue = document.getElementById('agility-value') as HTMLInputElement;
		const intelligenceValue = document.getElementById('intelligence-value') as HTMLInputElement;
		const enduranceInput = document.getElementById('endurance') as HTMLInputElement;
		const damageTakenInput = document.getElementById('damage-taken') as HTMLInputElement;

		if (strengthValue) {
			strengthValue.value = characterData.stats.strength.value.toString();
		}
		if (agilityValue) {
			agilityValue.value = characterData.stats.agility.value.toString();
		}
		if (intelligenceValue) {
			intelligenceValue.value = characterData.stats.intelligence.value.toString();
		}
		if (enduranceInput) {
			enduranceInput.value = characterData.endurance.toString();
		}
		if (damageTakenInput) {
			damageTakenInput.value = characterData.damageTaken.toString();
		}

		const skillRows = document.querySelectorAll('.skills-table tbody tr');

		skillRows.forEach((row, index) => {
			const skillBonusInput = row.querySelector('.skill-bonus') as HTMLInputElement;

			if (skillBonusInput && characterData.skills) {
				const skillNames = ['meleeOB', 'missileOB', 'db', 'running', 'general', 'trickery', 'perception', 'magical'];
				const skillValue = (characterData.skills as any)[skillNames[index]];
				if (skillValue) {
					skillBonusInput.value = skillValue.toString();
				}
			}
		});

		const equipmentInputs = document.querySelectorAll('.equipment-input');
		equipmentInputs.forEach((input, index) => {
			if (input instanceof HTMLInputElement && characterData.equipment[index]) {
				input.value = characterData.equipment[index];
			}
		});

		const armorInput = document.querySelector('input[type="text"].worn-input') as HTMLInputElement;
		const cloakInput = document.querySelectorAll('input[type="text"].worn-input')[1] as HTMLInputElement;
		const daggerInput = document.querySelectorAll('input[type="text"].worn-input')[2] as HTMLInputElement;
		const beltInput = document.querySelector('.belt-input') as HTMLInputElement;
		const specialItemsInput = document.querySelector('.special-items-input') as HTMLInputElement;

		if (armorInput && characterData.worn.armor) {
			armorInput.value = characterData.worn.armor;
		}
		if (cloakInput && characterData.worn.cloak) {
			cloakInput.value = characterData.worn.cloak;
		}
		if (daggerInput && characterData.worn.dagger) {
			daggerInput.value = characterData.worn.dagger;
		}
		if (beltInput && characterData.worn.belt) {
			beltInput.value = characterData.worn.belt;
		}
		if (specialItemsInput && characterData.specialItems) {
			specialItemsInput.value = characterData.specialItems;
		}

		const timeInput = document.querySelector('.time-input') as HTMLInputElement;
		const expInput = document.querySelector('.exp-input') as HTMLInputElement;
		const daysInput = document.querySelector('.days-input') as HTMLInputElement;

		if (timeInput && characterData.time) {
			timeInput.value = characterData.time;
		}
		if (expInput && characterData.experiencePoints) {
			expInput.value = characterData.experiencePoints;
		}
		if (daysInput && characterData.days) {
			daysInput.value = characterData.days;
		}

		const spellSelects = document.querySelectorAll('.spell-select');
		spellSelects.forEach((select, index) => {
			if (select instanceof HTMLSelectElement && characterData.selectedSpells[index]) {
				select.value = characterData.selectedSpells[index];
			}
		});

		this.data = characterData;

		this.applyRacialBonuses();
		this.updateSpellRestrictions();
		this.updateRaceDescription();
		this.updateStatBonuses();
		this.calculateEndurance();
		this.updateSkillBonuses();
	}

	private deleteCharacter(characterName: string): void {
		if (!confirm(`Are you sure you want to delete the character "${characterName}"? This cannot be undone.`)) {
			return;
		}

		const savedCharacters = this.getSavedCharacters();
		const filteredCharacters = savedCharacters.filter(char => char.name !== characterName);

		localStorage.setItem('tolkien-quest-characters', JSON.stringify(filteredCharacters));
		this.loadSavedCharactersList();

		alert(`Character "${characterName}" deleted successfully.`);
	}

	private collectFormData(): CharacterData {
		const nameInput = document.getElementById('character-name') as HTMLInputElement;
		const raceSelect = document.getElementById('race-select') as HTMLSelectElement;

		const strengthValue = document.getElementById('strength-value') as HTMLInputElement;
		const agilityValue = document.getElementById('agility-value') as HTMLInputElement;
		const intelligenceValue = document.getElementById('intelligence-value') as HTMLInputElement;
		const enduranceInput = document.getElementById('endurance') as HTMLInputElement;
		const damageTakenInput = document.getElementById('damage-taken') as HTMLInputElement;

		const equipmentInputs = document.querySelectorAll('.equipment-input');
		const equipment = Array.from(equipmentInputs).map(input => (input as HTMLInputElement).value || '');

		const wornInputs = document.querySelectorAll('.worn-input');
		const worn = {
			armor: (wornInputs[0] as HTMLInputElement)?.value || '',
			cloak: (wornInputs[1] as HTMLInputElement)?.value || '',
			dagger: (wornInputs[2] as HTMLInputElement)?.value || '',
			belt: (document.querySelector('.belt-input') as HTMLInputElement)?.value || ''
		};

		const spellSelects = document.querySelectorAll('.spell-select');
		const selectedSpells = Array.from(spellSelects).map(select => (select as HTMLSelectElement).value || '');

		return {
			name: nameInput?.value || '',
			race: raceSelect?.value || '',
			stats: {
				strength: {
					value: parseInt(strengthValue?.value || '0') || 0,
					bonus: this.data.stats.strength.bonus
				},
				agility: {
					value: parseInt(agilityValue?.value || '0') || 0,
					bonus: this.data.stats.agility.bonus
				},
				intelligence: {
					value: parseInt(intelligenceValue?.value || '0') || 0,
					bonus: this.data.stats.intelligence.bonus
				}
			},
			endurance: parseInt(enduranceInput?.value || '20') || 20,
			damageTaken: parseInt(damageTakenInput?.value || '0') || 0,
			skills: this.data.skills,
			racialBonuses: this.data.racialBonuses,
			equipment,
			worn,
			specialItems: (document.querySelector('.special-items-input') as HTMLInputElement)?.value || '',
			time: (document.querySelector('.time-input') as HTMLInputElement)?.value || '',
			days: (document.querySelector('.days-input') as HTMLInputElement)?.value || '',
			experiencePoints: (document.querySelector('.exp-input') as HTMLInputElement)?.value || '',
			selectedSpells,
			restrictedSpells: this.data.restrictedSpells
		};
	}

	private getSavedCharacters(): CharacterData[] {
		const saved = localStorage.getItem('tolkien-quest-characters');
		return saved ? JSON.parse(saved) : [];
	}

	private loadSavedCharactersList(): void {
		const container = document.getElementById('saved-characters-list');
		if (!container) {
			return;
		}

		const savedCharacters = this.getSavedCharacters();

		if (savedCharacters.length === 0) {
			container.innerHTML = '<p class="no-characters">No saved characters</p>';
			return;
		}

		const charactersHtml = savedCharacters.map(character => `
      <div class="character-item">
        <div class="character-info" data-character-name="${character.name}">
          <span class="character-name">${character.name}</span>
          <span class="character-race">${character.race || 'No race selected'}</span>
        </div>
        <div class="character-actions">
          <button class="load-btn" data-character-name="${character.name}">Load</button>
          <button class="delete-btn" data-character-name="${character.name}">Delete</button>
        </div>
      </div>
    `).join('');

		container.innerHTML = charactersHtml;

		container.querySelectorAll('.load-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const characterName = (e.target as HTMLElement).getAttribute('data-character-name');
				if (characterName) {
					const character = savedCharacters.find(char => char.name === characterName);
					if (character) {
						this.loadCharacter(character);
						alert(`Character "${characterName}" loaded successfully!`);
					}
				}
			});
		});

		container.querySelectorAll('.delete-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const characterName = (e.target as HTMLElement).getAttribute('data-character-name');
				if (characterName) {
					this.deleteCharacter(characterName);
				}
			});
		});

		container.querySelectorAll('.character-info').forEach(info => {
			info.addEventListener('click', (e) => {
				const characterName = (e.currentTarget as HTMLElement).getAttribute('data-character-name');
				if (characterName) {
					const character = savedCharacters.find(char => char.name === characterName);
					if (character) {
						this.loadCharacter(character);
						alert(`Character "${characterName}" loaded successfully!`);
					}
				}
			});
		});
	}

}

new CharacterSheet();