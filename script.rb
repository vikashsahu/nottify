require 'rubygems'
require 'nokogiri'
require 'open-uri'

url = "http://usatt.simplycompete.com/t/search?embedded=true"

cond = false
increment = 5

while !cond || increment > 0

	doc = open(url, &:read)
	nokogiriDoc = Nokogiri::HTML(doc)

	iccNode = nokogiriDoc.at('td:contains("2018 ICC Butterfly America Open")')

	cond = iccNode.parent.inner_html.include?('Results not processed yet')
	puts cond

	increment--

	sleep(30) #seconds

end
