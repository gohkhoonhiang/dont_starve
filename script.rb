require 'json'
require 'csv'
require 'nokogiri'

FOOD_GROUPS = [
  'Vegetables',
  'Eggs',
  'Fishes',
  'Meats',
  'Fruits',
  'Monster Foods',
  'Dairy',
  'Bugs',
  'Inedibles'
].freeze

VEGETABLES = [
  'Aloe', 'Asparagus', 'Blue Cap', 'Cactus Flesh', 'Cactus Flower', 'Carrot',
  'Corn', 'Corn Cod', 'Dark Petals', 'Eggplant', 'Foliage', 'Garlic',
  'Glow Berry', 'Green Cap', 'Kelp Fronds', 'Lichen', 'Mandrake', 'Moon Shroom',
  'Onion', 'Pepper', 'Petals', 'Popperfish', 'Potato', 'Pumpkin', 'Radish',
  'Red Cap', 'Ripe Stone Fruit', 'Seaweed', 'Succulent', 'Sweet Potato',
  'Toma Root'
].freeze

MEATS = [
  'Barnacles', 'Batilisk Wing', 'Dead Dogfish', 'Dead Swordfish',
  'Deerclops Eyeball', 'Dragoon Heart', 'Drumstick', 'Eel',
  'Eye of the Tiger Shark', 'Fish', 'Fish Meat', 'Fish Morsel', 'Flytrap Stalk',
  'Frog Legs', "Guardian's Horn", 'Koalefant Trunk', 'Leafy Meat', 'Meat',
  'Monster Meat', 'Morsel', 'Naked Nostrils', 'Neon Quattro', 'Pierrot Fish',
  'Poison Dartfrog Legs', 'Purple Grouper', 'Raw Fish', 'Roe', 'Shark Fin',
  'Tropical Fish', 'Winter Koalefant Trunk'
].freeze

module Shared
  def html_to_csv(input, output)
    f = File.open(input)
    doc = Nokogiri::HTML(f)
    csv = CSV.open(output, 'w', col_sep: ',', quote_char: '"', force_quotes: true, encoding: 'ISO8859-1:utf-8')
    yield doc, csv
    csv.close
  end

  def csv_to_json(input, output)
    content = CSV.read(input, col_sep: ',', headers: true)
    transformed = content.map { |r| r.to_h.map { |k, v| normalize(k, v) }.to_h }.sort_by { |r| r['name'] }
    File.open(output, 'w:ISO8859-1:utf-8') { |f| f.write(JSON.pretty_generate({ data: transformed })) }
  end

  def normalize(key, value)
    [key, value]
  end
end

class Crockpot
  include Shared

  def convert_html_to_csv(input, output)
    html_to_csv(input, output) do |doc, csv|
      csv << ['name', 'dlc', 'health', 'hunger', 'sanity', 'perish_time', 'cook_time', 'priority', 'requirements', 'filler_restrictions']

      doc.xpath('//table/tbody/tr').each do |row|
        tarray = []
        row.xpath('td').each_with_index do |cell, index|
          next if index.zero?

          if [2].include?(index)
            carray = []
            cell.children.each do |child|
              if child.name == 'a'
                carray << child.attr('title').to_s.gsub('icon', '').strip
              end
            end
            tarray << carray.join(', ')
          elsif [9, 10].include?(index)
            carray = []
            cell.children.each do |child|
              if child.name == 'a'
                carray << child.attr('title')
              else
                carray << child.text
                carray << ','
              end
            end
            tarray << carray.join('').split(',').map(&:strip).reject(&:empty?).join(' ')
          else
            tarray << cell.text.strip
          end
        end
        csv << tarray
      end
    end
  end

  def normalize(key, value)
    normalized = if key == 'dlc'
                   value.split(',').map(&:strip)
                 elsif %w(health hunger sanity).include?(key)
                   stats = value.split(',')
                   stats.map do |stat|
                     if stat.match(/.* in ([\d]+) min/)
                       value
                     else
                       value.to_f
                     end
                   end.join(',')
                 elsif key == 'requirements'
                   value.split(',').map do |ingredient|
                     captures = ingredient.match(/(\b[\w\s]+\b)×([\d\.]+)/).captures
                     "#{captures[0]} (#{captures[1]})"
                   end
                 elsif key == 'filler_restrictions'
                   value.split(',').map do |restriction|
                     matches = restriction.match(/(\b[\w\s]+\b)×([\d\.]+)/)
                     if matches
                       captures = matches.captures
                       "#{captures[0]} (#{captures[1]})"
                     else
                       restriction
                     end
                   end
                 elsif key == 'perish_time'
                   if value == 'Never'
                     9_999_999
                   else
                     value.tr('d', '').to_i
                   end
                 elsif key == 'cook_time'
                   value.tr('s', '').to_i
                 else
                   value
                 end
    [key, normalized]
  end
end

class Vegetable
  include Shared

  def convert_html_to_csv(input, output)
    html_to_csv(input, output) do |doc, csv|
      csv << ['name', 'sources', 'cooked', 'dried', 'dlc', 'value', 'crockpot']

      doc.xpath('//table/tbody/tr').each do |row|
        tarray = []
        row.xpath('td').each_with_index do |cell, index|
          next if [0, 2, 4].include?(index)

          if [6].include?(index)
            tarray << cell.xpath('a').attr('title')
          elsif [8].include?(index)
            tarray << (cell.text.strip == 'Yes')
          elsif [7].include?(index)
            tarray << cell.text.strip.to_f
          elsif [1, 3, 5].include?(index)
            tarray << cell.text.strip
          end
        end
        tarray.insert(1, tarray[0])
        next if tarray.all?(&:nil?)

        csv << tarray
      end
    end
  end

  def merge_stats_data(vegetable_input, stats_input, output)
    vegetables = JSON.parse(File.read(vegetable_input), symbolize_names: true)[:data]
    stats = JSON.parse(File.read(stats_input), symbolize_names: true)[:data]
    vegetables.each do |vegetable|
      matching_stat = stats.find { |s| s[:name] == vegetable[:name] }
      if matching_stat
        vegetable.merge!(matching_stat.slice(:health, :hunger, :sanity, :perish_time, :stacking))
      else
        vegetable.merge!(health: nil, hunger: nil, sanity: nil, perish_time: nil, stacking: nil)
      end
    end
    stats.select { |s| s[:name].match(/Cooked/) }.each do |stat|
      uncooked_name = stat[:name].gsub('Cooked ', '')
      matching_vegetable = vegetables.find { |v| v[:name] == uncooked_name }
      next unless matching_vegetable

      vegetables << matching_vegetable.merge(cooked: 'N/A', dried: 'N/A', **stat.slice(:name, :health, :hunger, :sanity, :perish_time, :stacking))
    end
    stats.select { |s| s[:name].match(/Dried/) }.each do |stat|
      uncooked_name = stat[:name].gsub('Dried ', '')
      matching_vegetable = vegetables.find { |v| v[:name] == uncooked_name }
      next unless matching_vegetable

      vegetables << matching_vegetable.merge(cooked: 'N/A', dried: 'N/A', **stat.slice(:name, :health, :hunger, :sanity, :perish_time, :stacking))
    end
    File.open(output, 'w:ISO8859-1:utf-8') { |f| f.write(JSON.pretty_generate({ data: vegetables.sort_by { |v| v[:name] } })) }
  end

  def normalize(key, value)
    normalized = if key == 'sources'
                   value.split(',')
                 else
                   value
                 end
    [key, normalized]
  end
end

class Meat
  include Shared

  def convert_html_to_csv(input, output)
    html_to_csv(input, output) do |doc, csv|
      csv << ['name', 'sources', 'cooked', 'dried', 'dlc', 'value', 'crockpot']

      raw_array = []
      doc.xpath('//table/tbody/tr').each do |row|
        tarray = []
        row.xpath('td').each_with_index do |cell, index|
          next if [0, 2, 4, 6].include?(index)

          if [8].include?(index)
            tarray << cell.xpath('a').attr('title')
          elsif [10].include?(index)
            tarray << (cell.text.strip == 'Yes')
          elsif [9].include?(index)
            tarray << cell.text.strip.to_f
          elsif [1, 3, 5, 7].include?(index)
            tarray << cell.text.strip
          end
        end
        raw_array << tarray
      end

      raw_array.reject { |r| r.all?(&:empty?) }.group_by { |r| r[1] }.each do |name, meats|
        sources = meats.reject { |m| m[0] == 'N/A' }.map { |m| m[0] }.join(',')
        csv << [name, sources.empty? ? name : sources, *meats.first[2..]]
      end
    end
  end

  def normalize(key, value)
    normalized = if key == 'sources'
                   value.split(',')
                 else
                   value
                 end
    [key, normalized]
  end

  def merge_stats_data(meat_input, stats_input, output)
    meats = JSON.parse(File.read(meat_input), symbolize_names: true)[:data]
    stats = JSON.parse(File.read(stats_input), symbolize_names: true)[:data]
    meats.each do |meat|
      matching_stat = stats.find { |s| s[:name] == meat[:name] }
      if matching_stat
        meat.merge!(matching_stat.slice(:health, :hunger, :sanity, :perish_time, :stacking))
      else
        meat.merge!(health: nil, hunger: nil, sanity: nil, perish_time: nil, stacking: nil)
      end
    end

    stats.select { |s| s[:name].match(/Cooked|Steak|Charred/) }.each do |stat|
      matching_meat = meats.find { |m| m[:cooked] == stat[:name] }
      next unless matching_meat

      meats << matching_meat.merge(cooked: 'N/A', dried: 'N/A', **stat.slice(:name, :health, :hunger, :sanity, :perish_time, :stacking))
    end

    jerkies = ['Jerky', 'Small Jerky', 'Monster Jerky']
    jerkies.each do |type|
      jerky = stats.find { |s| s[:name] == type }
      matching_meats = meats.select { |m| m[:dried] == type }
      meats << {}.tap do |h|
        h[:name] = jerky[:name]
        h[:sources] = matching_meats.map { |m| m[:name] }
        h[:cooked] = 'N/A'
        h[:dried] = 'N/A'
        h[:dlc] = ''
        h[:value] = jerky[:food_value]
        h[:crockpot] = 'true'
      end.merge(jerky.slice(:health, :hunger, :sanity, :perish_time, :stacking))
    end

    File.open(output, 'w:ISO8859-1:utf-8') { |f| f.write(JSON.pretty_generate({ data: meats.sort_by { |m| m[:name] } })) }
  end
end

class Seed
  include Shared

  def convert_html_to_csv(input, output)
    html_to_csv(input, output) do |doc, csv|
      csv << ['name', 'dlc', 'seed_name']

      doc.xpath('//table/tbody/tr').each do |row|
        tarray = []
        row.xpath('td').each_with_index do |cell, index|
          next if [0, 3, 5, 6].include?(index)

          if [2].include?(index)
            tarray << cell.xpath('a').attr('title')
          else
            tarray << cell.text.strip
          end
        end
        csv << tarray
      end
    end
  end
end

class FarmConfig
  def format_data(input, output)
    data = JSON.parse(File.read(input), symbolize_names: true)[:data].first
    transformed = []
    data.each do |season, configs|
      configs.each do |shape, plots|
        plots.each do |name, plot|
          transformed << {
            name: name,
            season: season,
            shape: shape,
            config: plot
          }
        end
      end
    end
    File.write(output, JSON.pretty_generate({ data: transformed }))
  end
end

class FarmPlant
  include Shared

  def convert_html_to_csv(input, output)
    html_to_csv(input, output) do |doc, csv|
      csv << ['name', 'seed_name', 'product_name', 'seasons', 'growth_formula', 'compost', 'manure', 'drink_rate']

      doc.xpath('//table/tbody/tr')[2..-1].each do |row|
        tarray = []
        row.xpath('td').each_with_index do |cell, index|
          next if [0].include?(index)

          if [2, 3].include?(index)
            tarray << cell.xpath('a').attr('title')
          elsif index == 4
            tarray << []
            map_season(tarray[3], index, cell)
          elsif [5, 6, 7].include?(index)
            map_season(tarray[3], index, cell)
          else
            tarray << cell.text.strip
          end
        end
        tarray[3] = tarray[3].join(',')
        csv << tarray
      end
    end
  end

  def merge_seeds_data(plant_input, seed_input, output)
    plants = JSON.parse(File.read(plant_input), symbolize_names: true)[:data]
    seeds = JSON.parse(File.read(seed_input), symbolize_names: true)[:data]
    plants.each do |plant|
      matching_seed = seeds.find { |s| s[:seed_name] == plant[:seed_name] }
      plant[:dlc] = matching_seed[:dlc] || ''
    end
    File.open(output, 'w:ISO8859-1:utf-8') { |f| f.write(JSON.pretty_generate({ data: plants.sort_by { |p| p[:name] } })) }
  end

  def map_season(seasons, index, cell)
    season = case index
             when 4
               'autumn'
             when 5
               'winter'
             when 6
               'spring'
             when 7
               'summer'
             end
    seasons << season if cell.text.strip == '+'
  end
end

class Nutrient
  include Shared

  def convert_html_to_csv(input, output)
    html_to_csv(input, output) do |doc, csv|
      csv << ['name', 'uses', 'growth_formula', 'compost', 'manure', 'wormwood_heal', 'wormwood_bloom']

      doc.xpath('//table/tbody/tr').each do |row|
        tarray = []
        row.xpath('td').each_with_index do |cell, index|
          next if [0].include?(index)

          if [3, 4, 5].include?(index)
            tarray << cell.text.strip&.split(' ').first
          else
            tarray << cell.text.strip
          end
        end
        csv << tarray
      end
    end
  end
end
