var latest_data_version = '4648b1a';

var normalizeDlc = function(value) {
  return value.map(ele => mapDlc(ele));
};

var mapDlc = function(value) {
  var dlc = '';
  if (value == "Don't Starve Together") {
    dlc = 'DST';
  } else if (value == "Shipwrecked") {
    dlc = 'SW';
  } else if (value == "Hamlet") {
    dlc = 'H';
  } else if (value == "Reign of Giants") {
    dlc = 'ROG';
  }
  return dlc;
};

var hasElement = function(array, value) {
  return array.filter(ele => ele === value).length > 0;
};

var addElement = function(array, value) {
  return array.concat(value);
};

var removeElement = function(array, value) {
  var foundIndex = array.indexOf(value);
  if (foundIndex >= 0) {
    array.splice(foundIndex, 1);
  }
  return array;
};

var crop_colors = {
  asparagus: { bg: '#566c62', fg: 'white--text' },
  carrot: { bg: '#c19c64', fg: 'black--text' },
  corn: { bg: '#808256', fg: 'black--text' },
  dragonfruit: { bg: '#8e3041', fg: 'white--text' },
  durian: { bg: '#6d7433', fg: 'black--text' },
  eggplant: { bg: '#634276', fg: 'white--text' },
  garlic: { bg: '#d5d0c8', fg: 'black--text' },
  onion: { bg: '#e7d8a9', fg: 'black--text' },
  pepper: { bg: '#c32c18', fg: 'white--text' },
  pomegranate: { bg: '#a03432', fg: 'white--text' },
  potato: { bg: '#c1b36f', fg: 'black--text' },
  pumpkin: { bg: '#b26513', fg: 'black--text' },
  toma: { bg: '#c06e37', fg: 'black--text' },
  tomaroot: { bg: '#c06e37', fg: 'black--text' },
  watermelon: { bg: '#4d8c4e', fg: 'black--text' },
};

var app = new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: {
      themes: {
        light: {
          primary: '#482d37',
          secondary: '#e9e8d9',
          header: '#686868',
          toolbar: '#f5f8fe',
          font: '#837865',
          error: '#8b104a',
        },
      },
    },
  }),

  created() {
    this.retrieveSettings();
    if (this.data_version !== latest_data_version) {
      this.getVegetableRecipeData();
      this.getMeatRecipeData();
      this.getCompleteRecipeData();
      this.getSeedData();
      this.getNutrientData();
      this.getVegetableData();
      this.getMeatData();
      this.getFarmingConfigData();
      this.data_version = latest_data_version;
    }
  },

  data: {
    tab: null,

    data_version: null,

    toggle_dlc: ['DST', 'SW', 'H', 'ROG'],

    health_threshold: 10,
    hunger_threshold: 10,
    sanity_threshold: 10,

    favourite_recipes: [],

    toggle_vegetable_favourite: false,
    vegetable_search: '',
    vegetable_requirements_materials: [],
    vegetable_requirements_search: [],
    vegetable_complete_data: [],
    vegetable_data: [],
    vegetable_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'DLC', filterable: false, value: 'dlc', filterable: false },
      { text: 'Health', filterable: false, value: 'health' },
      { text: 'Hunger', filterable: false, value: 'hunger' },
      { text: 'Sanity', filterable: false, value: 'sanity' },
      { text: 'Perish Time (days)', filterable: false, value: 'perish_time' },
      { text: 'Cook Time (sec)', filterable: false, value: 'cook_time' },
      { text: 'Priority', filterable: false, value: 'priority' },
      { text: 'Requirements', filterable: false, value: 'requirements' },
      { text: 'Filler Restrictions', filterable: false, value: 'filler_restrictions' },
      { text: 'Favourite', filterable: false, value: 'favourite' },
    ],

    toggle_meat_favourite: false,
    meat_search: '',
    meat_requirements_materials: [],
    meat_requirements_search: [],
    meat_complete_data: [],
    meat_data: [],
    meat_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'DLC', filterable: false, value: 'dlc', filterable: false },
      { text: 'Health', filterable: false, value: 'health' },
      { text: 'Hunger', filterable: false, value: 'hunger' },
      { text: 'Sanity', filterable: false, value: 'sanity' },
      { text: 'Perish Time (days)', filterable: false, value: 'perish_time' },
      { text: 'Cook Time (sec)', filterable: false, value: 'cook_time' },
      { text: 'Priority', filterable: false, value: 'priority' },
      { text: 'Requirements', filterable: false, value: 'requirements' },
      { text: 'Filler Restrictions', filterable: false, value: 'filler_restrictions' },
      { text: 'Favourite', filterable: false, value: 'favourite' },
    ],

    toggle_complete_recipes_favourite: false,
    complete_recipes_search: '',
    complete_recipes_requirements_materials: [],
    complete_recipes_requirements_search: [],
    complete_recipes_complete_data: [],
    complete_recipes_data: [],
    complete_recipes_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'DLC', filterable: false, value: 'dlc', filterable: false },
      { text: 'Health', filterable: false, value: 'health' },
      { text: 'Hunger', filterable: false, value: 'hunger' },
      { text: 'Sanity', filterable: false, value: 'sanity' },
      { text: 'Perish Time (days)', filterable: false, value: 'perish_time' },
      { text: 'Cook Time (sec)', filterable: false, value: 'cook_time' },
      { text: 'Priority', filterable: false, value: 'priority' },
      { text: 'Requirements', filterable: false, value: 'requirements' },
      { text: 'Filler Restrictions', filterable: false, value: 'filler_restrictions' },
      { text: 'Favourite', filterable: false, value: 'favourite' },
    ],

    seed_complete_data: [],
    seed_data: [],
    seed_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'Seed Name', filterable: false, value: 'seed_name' },
      { text: 'Product Name', filterable: false, value: 'product_name' },
      { text: 'Seasons', filterable: false, value: 'seasons' },
      { text: 'Growth Formula', filterable: false, value: 'growth_formula' },
      { text: 'Compost', filterable: false, value: 'compost' },
      { text: 'Manure', filterable: false, value: 'manure' },
      { text: 'Drink Rate', filterable: false, value: 'drink_rate' },
      { text: 'DLC', filterable: false, value: 'dlc', filterable: false },
    ],

    nutrient_complete_data: [],
    nutrient_data: [],
    nutrient_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'Uses', filterable: false, value: 'uses' },
      { text: 'Growth Formula', filterable: false, value: 'growth_formula' },
      { text: 'Compost', filterable: false, value: 'compost' },
      { text: 'Manure', filterable: false, value: 'manure' },
      { text: 'Wormwood Heal', filterable: false, value: 'wormwood_heal' },
      { text: 'Wormwood Bloom', filterable: false, value: 'wormwood_bloom', filterable: false },
    ],

    toggle_vegetable_crockpot: false,
    raw_vegetable_threshold: 0.5,
    raw_vegetable_complete_data: [],
    raw_vegetable_data: [],
    raw_vegetable_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'Sources', filterable: false, value: 'sources' },
      { text: 'Cooked Name', filterable: false, value: 'cooked' },
      { text: 'Dried Name', filterable: false, value: 'dried' },
      { text: 'Health', filterable: false, value: 'health' },
      { text: 'Hunger', filterable: false, value: 'hunger' },
      { text: 'Sanity', filterable: false, value: 'sanity' },
      { text: 'Perish Time (days)', filterable: false, value: 'perish_time' },
      { text: 'Value', filterable: false, value: 'value' },
      { text: 'DLC', filterable: false, value: 'dlc', filterable: false },
      { text: 'Valid for Crockpot?', filterable: false, value: 'crockpot' },
    ],

    toggle_meat_crockpot: false,
    raw_meat_threshold: 0.5,
    raw_meat_complete_data: [],
    raw_meat_data: [],
    raw_meat_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
      },
      { text: 'Sources', filterable: false, value: 'sources' },
      { text: 'Cooked Name', filterable: false, value: 'cooked' },
      { text: 'Dried Name', filterable: false, value: 'dried' },
      { text: 'DLC', filterable: false, value: 'dlc', filterable: false },
      { text: 'Value', filterable: false, value: 'value' },
      { text: 'Valid for Crockpot?', filterable: false, value: 'crockpot' },
    ],

    toggle_farm_season: ['spring', 'summer', 'autumn', 'winter'],
    farming_config_search: '',
    farming_config_plants: [],
    farming_config_plants_search: [],
    farming_config_complete_data: [],
    farming_config_data: [],
    farming_config_headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        filterable: true,
        value: 'name',
        width: 300,
      },
      { text: 'Season', filterable: false, value: 'season', width: 50 },
      { text: 'Shape', filterable: false, value: 'shape', width: 200 },
      { text: 'Config', filterable: false, value: 'config', width: 350 },
    ],
  },

  methods: {
    getVegetableRecipeData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/vegetable_recipes.json',
        method: 'GET'
      }).then(function (response) {
        var vegetable_data = JSON.parse(response).data;
        var formatted_data = vegetable_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_vegetable_' + row.name.replace(/\s/, '_').toLowerCase();
          updated_row.dlc = normalizeDlc(row.dlc);
          updated_row.favourite = hasElement(vm.favourite_recipes, updated_row.id);
          row.requirements.forEach(function(ele) {
            requirement = ele.replace(/\(.*\)/, '').trim();
            if (!hasElement(vm.vegetable_requirements_materials, requirement)) {
              vm.vegetable_requirements_materials = addElement(vm.vegetable_requirements_materials, requirement)
            }
          });
          return updated_row;
        });

        vm.vegetable_requirements_materials = vm.vegetable_requirements_materials.sort();
        vm.vegetable_complete_data = formatted_data;
      });
    },

    getMeatRecipeData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/meat_recipes.json',
        method: 'GET'
      }).then(function (response) {
        var meat_data = JSON.parse(response).data;
        var formatted_data = meat_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_meat_' + row.name.replace(/\s/, '_').toLowerCase();
          updated_row.dlc = normalizeDlc(row.dlc);
          updated_row.favourite = hasElement(vm.favourite_recipes, updated_row.id);
          row.requirements.forEach(function(ele) {
            requirement = ele.replace(/\(.*\)/, '').trim();
            if (!hasElement(vm.meat_requirements_materials, requirement)) {
              vm.meat_requirements_materials = addElement(vm.meat_requirements_materials, requirement)
            }
          });
          return updated_row;
        });

        vm.meat_requirements_materials = vm.meat_requirements_materials.sort();
        vm.meat_complete_data = formatted_data;
      });
    },

    getCompleteRecipeData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/complete_recipes.json',
        method: 'GET'
      }).then(function (response) {
        var complete_recipes_data = JSON.parse(response).data;
        var formatted_data = complete_recipes_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_complete_recipes_' + row.name.replace(/\s/, '_').toLowerCase();
          updated_row.dlc = normalizeDlc(row.dlc);
          updated_row.favourite = hasElement(vm.favourite_recipes, updated_row.id);
          row.requirements.forEach(function(ele) {
            requirement = ele.replace(/\(.*\)/, '').trim();
            if (!hasElement(vm.complete_recipes_requirements_materials, requirement)) {
              vm.complete_recipes_requirements_materials = addElement(vm.complete_recipes_requirements_materials, requirement)
            }
          });
          return updated_row;
        });

        vm.complete_recipes_requirements_materials = vm.complete_recipes_requirements_materials.sort();
        vm.complete_recipes_complete_data = formatted_data;
      });
    },

    getSeedData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/merged_plants_seeds.json',
        method: 'GET'
      }).then(function (response) {
        var seed_data = JSON.parse(response).data;
        var formatted_data = seed_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_seed_' + row.name.replace(/\s/, '_').toLowerCase();
          updated_row.dlc = mapDlc(row.dlc);
          updated_row.seasons = row.seasons.split(',');
          return updated_row;
        });

        vm.seed_complete_data = formatted_data;
      });

    },

    getNutrientData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/nutrients.json',
        method: 'GET'
      }).then(function (response) {
        var nutrient_data = JSON.parse(response).data;
        var formatted_data = nutrient_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_nutrient_' + row.name.replace(/\s/, '_').toLowerCase();
          return updated_row;
        });

        vm.nutrient_complete_data = formatted_data;
      });

    },

    getVegetableData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/vegetable_combined.json',
        method: 'GET'
      }).then(function (response) {
        var raw_vegetable_data = JSON.parse(response).data;
        var formatted_data = raw_vegetable_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_raw_vegetable_' + row.name.replace(/\s/, '_').toLowerCase();
          updated_row.dlc = mapDlc(row.dlc);
          updated_row.crockpot = row.crockpot === 'true';
          return updated_row;
        });

        vm.raw_vegetable_complete_data = formatted_data;
      });

    },

    getMeatData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/meats.json',
        method: 'GET'
      }).then(function (response) {
        var raw_meat_data = JSON.parse(response).data;
        var formatted_data = raw_meat_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_raw_meat_' + row.name.replace(/\s/, '_').toLowerCase();
          updated_row.dlc = mapDlc(row.dlc);
          updated_row.crockpot = row.crockpot === 'true';
          return updated_row;
        });

        vm.raw_meat_complete_data = formatted_data;
      });

    },

    getFarmingConfigData: function() {
      var vm = this;
      $.ajax({
        url: 'https://raw.githubusercontent.com/gohkhoonhiang/dont_starve_recipes/master/data/farm_plots.json',
        method: 'GET'
      }).then(function (response) {
        var farming_config_data = JSON.parse(response).data;
        var formatted_data = farming_config_data.map(function(row, index) {
          var updated_row = row;
          updated_row.id = index + '_farming_config_' + row.name.replace(/\s/, '_').toLowerCase();
          row.name.split('-').forEach(function(plant) {
            if (!hasElement(vm.farming_config_plants, plant)) {
              vm.farming_config_plants = addElement(vm.farming_config_plants, plant)
            }
          });
          return updated_row;
        });

        vm.farming_config_plants = vm.farming_config_plants.sort();
        vm.farming_config_complete_data = formatted_data;
      });

    },

    filterData: function(data, toggle_dlc, toggle_boolean, requirements_search) {
      var vm = this;
      var filtered_data = data;
      filtered_data = vm.filterByDlc(filtered_data, toggle_dlc);
      if (toggle_boolean) {
        var field = toggle_boolean.field;
        var value = toggle_boolean.value;
        filtered_data = vm.filterByBoolean(filtered_data, field, value);
      }
      if (requirements_search) {
        filtered_data = vm.filterByRequirements(filtered_data, requirements_search);
      }
      return filtered_data;
    },

    filterByDlc: function(data, toggle_dlc) {
      var vm = this;
      var search = toggle_dlc;
      if (search.length === 0) {
        return data.filter(r => r.dlc.length === 0);
      } else {
        return data.filter(function(recipe) {
          return recipe.dlc.length === 0 || search.some(s => recipe.dlc.includes(s));
        })
      }
    },

    filterBySeason: function(data, toggle_farm_season) {
      var vm = this;
      var search = toggle_farm_season;
      if (search.length === 0) {
        return [];
      } else {
        return data.filter(row => toggle_farm_season.includes(row.season)); 
      }
    },

    filterByBoolean: function(data, field, toggle_boolean) {
      var vm = this;
      if (!toggle_boolean) { return data; }

      return data.filter(r => r[field]);
    },

    filterByRequirements: function(data, requirements_search) {
      var vm = this;
      var search = requirements_search;
      if (search.length === 0) { return data; }

      return data.filter(function(recipe) {
        var required = recipe.requirements.map(r => r.replace(/\(.*\)/, '').trim());
        return search.every(s => required.includes(s));
      });
    },

    filterVegetableRecipeData: function() {
      var vm = this;
      vm.vegetable_data = vm.filterData(vm.vegetable_complete_data, vm.toggle_dlc, { field: 'favourite', value: vm.toggle_vegetable_favourite }, vm.vegetable_requirements_search);
    },

    filterMeatRecipeData: function() {
      var vm = this;
      vm.meat_data = vm.filterData(vm.meat_complete_data, vm.toggle_dlc, { field: 'favourite', value: vm.toggle_meat_favourite }, vm.meat_requirements_search);
    },

    filterCompleteRecipeData: function() {
      var vm = this;
      vm.complete_recipes_data = vm.filterData(vm.complete_recipes_complete_data, vm.toggle_dlc, { field: 'favourite', value: vm.toggle_complete_recipes_favourite }, vm.complete_recipes_requirements_search);
    },

    filterVegetableData: function() {
      var vm = this;
      vm.raw_vegetable_data = vm.filterData(vm.raw_vegetable_complete_data, vm.toggle_dlc, { field: 'crockpot', value: vm.toggle_vegetable_crockpot }, null);
    },

    filterMeatData: function() {
      var vm = this;
      vm.raw_meat_data = vm.filterData(vm.raw_meat_complete_data, vm.toggle_dlc, { field: 'crockpot', value: vm.toggle_meat_crockpot }, null);
    },

    filterByPlants: function(data, plants_search) {
      var vm = this;
      var search = plants_search;
      if (search.length === 0) { return data; }

      return data.filter(function(farm_config) {
        var required = farm_config.name.split('-');
        return search.every(s => required.includes(s));
      });
    },

    filterFarmingConfigData: function() {
      var vm = this;
      vm.farming_config_data = vm.filterBySeason(vm.farming_config_complete_data, vm.toggle_farm_season);
      vm.farming_config_data = vm.filterByPlants(vm.farming_config_complete_data, vm.farming_config_plants_search);
    },

    highlightValue: function(value, threshold) {
      if (parseFloat(value) >= parseFloat(threshold)) {
        return '#8b104a';
      } else {
        return 'white';
      }
    },

    highlightText: function(value, threshold) {
      if (parseFloat(value) >= parseFloat(threshold)) {
        return 'white';
      } else {
        return 'black';
      }
    },

    formatFloat: function(value) {
      if (isNaN(parseFloat(value))) {
        return 'N/A';
      } else {
        return parseFloat(value);
      }
    },

    colorFarmPlot: function(val) {
      if (crop_colors[val] === undefined) {
        return 'white';
      } else {
        return crop_colors[val].bg;
      }
    },

    colorFarmPlotText: function(val) {
      if (crop_colors[val] == undefined) {
        return 'black--text';
      } else {
        return crop_colors[val].fg;
      }
    },

    updateFavourite: function(row) {
      var vm = this;
      if (row.favourite) {
        if (!hasElement(vm.favourite_recipes, row.id)) {
          vm.favourite_recipes = addElement(vm.favourite_recipes, row.id);
        }
      } else {
        if (hasElement(vm.favourite_recipes, row.id)) {
          vm.favourite_recipes = removeElement(vm.favourite_recipes, row.id);
        }
      }
    },

    clearVegetableRecipeFilters: function() {
      var vm = this;
      vm.vegetable_search = '';
      vm.toggle_vegetable_favourite = false;
    },

    clearMeatRecipeFilters: function() {
      var vm = this;
      vm.meat_search = '';
      vm.toggle_meat_favourite = false;
    },

    clearCompleteRecipeFilters: function() {
      var vm = this;
      vm.complete_recipes_search = '';
      vm.toggle_complete_recipes_favourite = false;
    },

    clearVegetableFilters: function() {
      var vm = this;
      vm.toggle_vegetable_crockpot = false;
    },

    clearMeatFilters: function() {
      var vm = this;
      vm.toggle_meat_crockpot = false;
    },

    clearFarmingConfigFilters: function() {
      var vm = this;
      vm.farming_config_search = '';
      vm.toggle_farm_season = ['spring', 'summer', 'autumn', 'winter'];
      vm.farming_config_plants_search = [];
    },

    retrieveSettings: function() {
      var vm = this;
      var settings = JSON.parse(localStorage.getItem('dont_starve_recipes_settings'));
      if (!settings) { return; }

      for (var property in settings) {
        vm[property] = settings[property];
      }
    },

    storeSettings: function() {
      var vm = this;
      var settings = {
        data_version: vm.data_version,
        toggle_dlc: vm.toggle_dlc,
        health_threshold: vm.health_threshold,
        hunger_threshold: vm.hunger_threshold,
        sanity_threshold: vm.sanity_threshold,
        favourite_recipes: vm.favourite_recipes,
        vegetable_complete_data: vm.vegetable_complete_data,
        vegetable_requirements_materials: vm.vegetable_requirements_materials,
        toggle_vegetable_favourite: vm.toggle_vegetable_favourite,
        meat_complete_data: vm.meat_complete_data,
        meat_requirements_materials: vm.meat_requirements_materials,
        toggle_meat_favourite: vm.toggle_meat_favourite,
        complete_recipes_complete_data: vm.complete_recipes_complete_data,
        complete_recipes_requirements_materials: vm.complete_recipes_requirements_materials,
        toggle_complete_recipes_favourite: vm.toggle_complete_recipes_favourite,
        seed_complete_data: vm.seed_complete_data,
        nutrient_complete_data: vm.nutrient_complete_data,
        raw_vegetable_threshold: vm.raw_vegetable_threshold,
        toggle_vegetable_crockpot: vm.toggle_vegetable_crockpot,
        raw_vegetable_complete_data: vm.raw_vegetable_complete_data,
        raw_meat_threshold: vm.raw_meat_threshold,
        toggle_meat_crockpot: vm.toggle_meat_crockpot,
        raw_meat_complete_data: vm.raw_meat_complete_data,
        toggle_farm_season: vm.toggle_farm_season,
        farming_config_complete_data: vm.farming_config_complete_data,
        farming_config_plants_search: vm.farming_config_plants_search,
        farming_config_plants: vm.farming_config_plants,
      };

      localStorage.setItem('dont_starve_recipes_settings', JSON.stringify(settings));
    },

    resetSettings: function() {
      localStorage.removeItem('dont_starve_recipes_settings');
    },

  },

  watch: {
    data_version: function(new_val, old_val) {
      var vm = this;
      if (new_val !== old_val) {
        vm.storeSettings();
      }
    },

    vegetable_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.filterVegetableRecipeData();
        vm.storeSettings();
      }
    },

    meat_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.filterMeatRecipeData();
        vm.storeSettings();
      }
    },

    complete_recipes_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.filterCompleteRecipeData();
        vm.storeSettings();
      }
    },

    seed_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.storeSettings();
      }
    },

    nutrient_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.storeSettings();
      }
    },

    raw_vegetable_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.storeSettings();
      }
    },

    raw_meat_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.storeSettings();
      }
    },

    farming_config_complete_data: function(new_val, old_val) {
      var vm = this;
      if (new_val.length > 0) {
        vm.filterFarmingConfigData();
        vm.storeSettings();
      }
    },

    toggle_dlc: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableRecipeData();
      vm.storeSettings();
    },

    toggle_vegetable_favourite: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableRecipeData();
      vm.storeSettings();
    },

    toggle_meat_favourite: function(new_val, old_val) {
      var vm = this;
      vm.filterMeatRecipeData();
      vm.storeSettings();
    },

    toggle_complete_recipes_favourite: function(new_val, old_val) {
      var vm = this;
      vm.filterCompleteRecipeData();
      vm.storeSettings();
    },

    toggle_vegetable_crockpot: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableData();
      vm.storeSettings();
    },

    toggle_meat_crockpot: function(new_val, old_val) {
      var vm = this;
      vm.filterMeatData();
      vm.storeSettings();
    },

    toggle_farm_season: function(new_val, old_val) {
      var vm = this;
      vm.filterFarmingConfigData();
      vm.storeSettings();
    },

    health_threshold: function(new_val, old_val) {
      var vm = this;
      vm.storeSettings();
    },

    hunger_threshold: function(new_val, old_val) {
      var vm = this;
      vm.storeSettings();
    },

    sanity_threshold: function(new_val, old_val) {
      var vm = this;
      vm.storeSettings();
    },

    vegetable_requirements_search: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableRecipeData();
      vm.storeSettings();
    },

    meat_requirements_search: function(new_val, old_val) {
      var vm = this;
      vm.filterMeatRecipeData();
      vm.storeSettings();
    },

    complete_recipes_requirements_search: function(new_val, old_val) {
      var vm = this;
      vm.filterCompleteRecipeData();
      vm.storeSettings();
    },

    farming_config_plants_search: function(new_val, old_val) {
      var vm = this;
      vm.filterFarmingConfigData();
      vm.storeSettings();
    },

    favourite_recipes: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableRecipeData();
      vm.filterMeatRecipeData();
      vm.filterCompleteRecipeData();
      vm.storeSettings();
    },

  },

  filters: {

  },
});
