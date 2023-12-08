import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BarChart() {
    const [filteredData, setFilteredData] = useState([]); // State for filtered data
    const allData = useRef(null); // Ref to store the full dataset

    // Function to filter data based on country
    const loadData = async () => {
        try {
            const dataPath = '/assets/data/agData.csv';
            allData.current = await d3.csv(dataPath);
            
            filterDataByCountry("United States of America");
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
        // if there is already a chart drawn, remove this chart
        d3.select("#CountryChart").selectAll("*").remove()
        // draw new chart
        let config = getCountryChartConfig()
        let scales = getCountryChartScales(country, config);

        // Create axis groups only once, will update them with values when necessary
        config.container.append("g")
            .attr("id", "x-axis")
            .style("transform", `translate(${config.margin.left}px,${config.height - config.margin.bottom}px)`)
            .call(d3.axisBottom(scales.xScale))

        config.container.append("g")
            .attr("id", "y-axis")
            .style("transform", `translate(${config.margin.left}px,${config.margin.top}px)`)
            .call(d3.axisLeft(scales.yScale))


        drawBarsCountryChart(country, scales, config)
        drawAxesCountryChart(country, scales, config);
        
    }

    const drawBarsCountryChart = (country, scales, config) => {
        let {margin, container} = config
        let {xScale, yScale} = scales
        //for transition animation
        let transition = d3.transition().duration(700)

        let body = container.append("g")
            .style("transform", 
                `translate(${margin.left}px,${margin.top}px)`
            )

        let bars = body.selectAll(".bar")
            .data(country)

        //Adding a rect tag for each resource
        bars.enter().append("rect")
            .merge(bars)
            .attr("height", yScale.bandwidth())
            .attr("y", (d) => yScale(d.Item))
            .attr("width", 0)
            .transition(transition)
            .attr("width", (d) => xScale(d.Value))
            .attr("fill", "#82204A")
            
        
        bars.exit()
            .transition(transition)
            .attr("width", 0)
            .remove()
            
    }
    
    
    function drawAxesCountryChart(country, scales, config){
        let {xScale, yScale} = scales
        let {container, margin, height} = config
        let transition = d3.transition().duration(750)

        container.select("#x-axis")
            .transition(transition)
            .call(d3.axisBottom(xScale))
        
        container.select("#y-axis")
            .transition(transition)
            .call(d3.axisLeft(yScale))

        // changing the font
        d3.selectAll(".tick text")
            .classed("fill-veridian font-questrial text-md", true)

    }

    //load data upon initial load of the page
    useEffect(() => {
        loadData();
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
        <div className='bg-fuchsia-500'>
            <svg id='CountryChart' className='border-solid border-stone-500 '/>
            <button onClick={() => handleCountryChange('Canada')}>Show Canada Data</button>
        </div>
    );
}

export default BarChart;
