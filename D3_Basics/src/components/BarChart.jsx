import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import downArrow from '/assets/icons/downArrow.svg'

function BarChart() {
    const [filteredData, setFilteredData] = useState([]); // State for filtered data
    const [dropOpen, setDropOpen] = useState(false)
    const [currCountry, setCurrCountry] = useState("New Zealand")
    

    const allData = useRef(null) // Ref to store the full dataset
    const countryList = useRef(null)

    // Function to filter data based on country
    const loadData = async () => {
        try {
            const dataPath = '/assets/data/agData.csv';
            allData.current = await d3.csv(dataPath);
            countryList.current = Array.from(new Set(allData.current.map(d => d.Area)))
            console.log(countryList.current);

            filterDataByCountry("New Zealand");
        } catch (error) {
            console.log("There was an error retrieving the data: ", error);
        }
    };
    
    const filterDataByCountry = (country) => {
        if (allData.current) {
            let filtered = allData.current.filter(d => d.Area === country);
            
            // get 5 most profitable resources per country
            filtered = filtered.sort((a, b) => d3.descending(+a.Value, +b.Value))
            let topFive = filtered.slice(0, 5);
            console.log(topFive);
            setFilteredData(topFive);
        }
    };
    
    //
    // CHART DRAWING IMPLEMENTATION
    //
    const getCountryChartConfig = () => {
        let width = 800;
        let height = 700;
        let margin = {
            top: 10,
            bottom: 50,
            left: 130,
            right: 10
        }
        //The body is the area that will be occupied by the bars.
        let bodyHeight = height - margin.top - margin.bottom
        let bodyWidth = width - margin.left - margin.right

        //The container is the SVG where we will draw the chart. In our HTML is the svg ta with the id AirlinesChart
        let container = d3.select("#CountryChart")
        container
            .attr("width", width)
            .attr("height", height)
            .classed('bg-jasmine border-2', true)
        
        return { width, height, margin, bodyHeight, bodyWidth, container }
    }

    const getCountryChartScales = (country, config) => {
        let { bodyWidth, bodyHeight } = config;
        let maximumCount = d3.max(country, d => +d.Value)

        let xScale = d3.scaleLinear()
            .range([0, bodyWidth])
            .domain([0, maximumCount])

        let yScale = d3.scaleBand()
            .range([0, bodyHeight])
            .domain(country.map(a => a.Item)) //The domain is the list of items being produced in this country
            .padding(0.3)
            
        return { xScale, yScale }
    }

    const drawCountryChart = (country) => {
        // draw new chart or update existing chart
        let config = getCountryChartConfig()
        let scales = getCountryChartScales(country, config);

        drawBarsCountryChart(country, scales, config)
        drawAxesCountryChart(country, scales, config);
        
    }

    const drawBarsCountryChart = (country, scales, config) => {
        let { container} = config
        let {xScale, yScale} = scales
        //for transition animation
        let t = d3.transition().duration(700)

        const body = container.select("#chart-body")

        body.selectAll(".bar")
            .data(country)
            .join(
                enter => enter.append("rect")
                    .attr("class", "bar")
                    .attr("height", yScale.bandwidth())
                    .attr("width", 0)
                    .attr("y", (d) => yScale(d.Item))
                    .attr("fill", "#82204A")
                  .call(enter => enter.transition(t)
                    .attr("width", (d) => xScale(d.Value))),
                update => update
                  .call(update => update.transition(t)
                    .attr("width", (d) => xScale(d.Value))),
                exit => exit
                    .attr("width", 0)
                  .call(exit => exit.transition(t)
                    .attr("width", 0)
                    .remove())
            )
            
    }
    
    
    function drawAxesCountryChart(country, scales, config){
        let {xScale, yScale} = scales
        let {container} = config
        let transition = d3.transition().duration(750)

        container.select("#x-axis")
            .transition(transition)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("$")).ticks(5))
        
        container.select("#y-axis")
            .transition(transition)
            .call(d3.axisLeft(yScale))
            .selectAll(".tick text")
                .text(d => d.length > 20 ? d.substring(0, 20) + "..." : d)

        // changing the font
        d3.selectAll(".tick text")
            .classed("font-questrial text-md", true)

    }

    //load data upon initial load of the page
    useEffect(() => {
        loadData();
        let config = getCountryChartConfig()
        config.container.append("g")
            .attr("id", "x-axis")
            .style("transform", `translate(${config.margin.left}px,${config.height - config.margin.bottom}px)`)

        config.container.append("g")
            .attr("id", "y-axis")
            .style("transform", `translate(${config.margin.left}px,${config.margin.top}px)`)
        
        config.container.append("g")
            .attr("id", "chart-body")
            .style("transform", `translate(${config.margin.left}px,${config.margin.top}px)`)

            
    }, []);


    useEffect(() => {
        if(filteredData.length > 0) {
            drawCountryChart(filteredData);
        }
    }, [filteredData])

    // This could be tied to a dropdown or other input in your UI
    const handleCountryChange = (newCountry) => {
        filterDataByCountry(newCountry);
    };

    return (
        <div className='bg-oxford h-max'>
            <h1 className='text-white font-rozha text-3xl px-6 pt-4'>{currCountry}</h1>
            <div className='flex'>
                <svg id='CountryChart' className='border-solid border-veridian border-4 m-6 mr-8'/>
                <div className='relative m-8'>
                    <button onClick={() => setDropOpen(!dropOpen)} className='flex justify-between text-left px-2 h-8 w-44 text-lg rounded-lg overflow-hidden bg-veridian border-2 border-white focus: outline-none focus:border-white font-questrial text-white'>
                        Change Country
                        <img src={downArrow} alt="Dropdown Button" className='w-3 pt-2' />
                    </button>
                    <ul className={`absolute mt-2 w-48 bg-white py-2 rounded-lg shadow-xl ${dropOpen ? "": "hidden"} overflow-scroll h-40`}>
                        {countryList.current && countryList.current.map((c) => (
                            <li onClick={() => {
                                handleCountryChange(c)
                                setCurrCountry(c)
                            
                            }} key={c} className='block text-left px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white font-questria'>{c}</li>
                        ))}
                    </ul>
                </div>
            </div>
            
        </div>
    );
}

export default BarChart;
