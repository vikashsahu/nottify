require 'rubygems'
require 'nokogiri'
require 'open-uri'

url = "http://usatt.simplycompete.com/t/search?embedded=true"

doc = open(url, &:read)

nokogiriDoc = Nokogiri::HTML(doc)

iccNode = nokogiriDoc.at('td:contains("2018 ICC Butterfly America Open")')

puts iccNode.parent.inner_html.include?('Results not processed yet')

