var latest_data_version = 'ddd1e80';

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
      this.getVegetableData();
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
    requirements_materials: [],

    toggle_vegetable_favourite: false,
    vegetable_search: '',
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

  },

  methods: {
    getVegetableData: function() {
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
            if (!hasElement(vm.requirements_materials, requirement)) {
              vm.requirements_materials = addElement(vm.requirements_materials, requirement)
            }
          });
          return updated_row;
        });

        vm.requirements_materials = vm.requirements_materials.sort();
        vm.vegetable_complete_data = formatted_data;
      });
    },

    filterData: function(data, toggle_dlc, toggle_favourite, requirements_search) {
      var vm = this;
      var filtered_data = data;
      filtered_data = vm.filterByDlc(filtered_data, toggle_dlc);
      filtered_data = vm.filterByFavourite(filtered_data, toggle_favourite);
      filtered_data = vm.filterByRequirements(filtered_data, requirements_search);
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

    filterByFavourite: function(data, toggle_favourite) {
      var vm = this;
      if (!toggle_favourite) { return data; }

      return data.filter(r => r.favourite);
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

    filterVegetableData: function() {
      var vm = this;
      vm.vegetable_data = vm.filterData(vm.vegetable_complete_data, vm.toggle_dlc, vm.toggle_vegetable_favourite, vm.vegetable_requirements_search);
    },

    highlightValue: function(value, threshold) {
      if (value >= threshold) {
        return '#8b104a';
      } else {
        return 'white';
      }
    },

    highlightText: function(value, threshold) {
      if (value >= threshold) {
        return 'white';
      } else {
        return 'black';
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

    clearVegetableFilters: function() {
      var vm = this;
      vm.vegetable_search = '';
      vm.toggle_vegetable_favourite = false; 
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
        vegetable_complete_data: vm.vegetable_complete_data,
        requirements_materials: vm.requirements_materials,
        toggle_dlc: vm.toggle_dlc,
        toggle_vegetable_favourite: vm.toggle_vegetable_favourite,
        health_threshold: vm.health_threshold,
        hunger_threshold: vm.hunger_threshold,
        sanity_threshold: vm.sanity_threshold,
        favourite_recipes: vm.favourite_recipes,
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
        vm.filterVegetableData();
        vm.storeSettings();
      }
    },

    toggle_dlc: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableData();
      vm.storeSettings();
    },

    toggle_vegetable_favourite: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableData();
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
      vm.filterVegetableData();
      vm.storeSettings();
    },

    favourite_recipes: function(new_val, old_val) {
      var vm = this;
      vm.filterVegetableData();
      vm.storeSettings();
    },

  },

  filters: {

  },
});
