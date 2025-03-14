// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 750,
        height = 400;
    
    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    // Create the SVG container
    let svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'pink')

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform            
    
    let yscale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    let xscale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // unique list of the platforms
        .range([margin.left, width - margin.right])
        .padding(0.5);

    // Add scales     
    let yaxis = svg.append('g')
        .call(d3.axisLeft().scale(yscale))
        .attr('transform', `translate(${margin.left} , 0)`);
              
    let xaxis = svg.append('g')
        .call(d3.axisBottom().scale(xscale))
        .attr('transform', `translate(0,${height - margin.bottom})`);

    // Add x-axis
    svg.append('text')
        .text('Platform')
        .attr('x', width / 2)
        .attr('y', height - 15);

    // Add y-axis
    svg.append('text')
        .text('Number of Likes')
        .attr('x', -250)
        .attr('y', 18)
        .attr('transform', 'rotate(-90)');
  
    // Add title   
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Box Plot for Likes Distributions across Platforms");
    

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.median(values);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);

        return { min, q1, median, q3, max };
    };

    /*
    The first line starting with "const quantilesByGroups" 
    figures out the statistics for each platform; that is, figuring out the min, q1,
    median, q3, and max values for each social media platform.
    
    The second part starting with "quantilesByGroups.forEach" actually
    creates the box plot.
    */
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xscale(Platform);
        const boxWidth = xscale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yscale(quantiles.min))
            .attr("y2", yscale(quantiles.q1))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yscale(quantiles.q3))
            .attr("y2", yscale(quantiles.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yscale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yscale(quantiles.q1) - yscale(quantiles.q3))
            .attr("stroke", "black")
            .attr("fill", "#69b3a2");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yscale(quantiles.median))
            .attr("y2", yscale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });

});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes.

// Load the CSV file
const socialMediaAvg = d3.csv("SocialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600,
        height = 400;

    let margin = {
        top: 50,
        bottom: 50,
        left: 80,  // Increased space for the y-axis
        right: 50
    };

    // Create the SVG container
    let svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique platforms and post types
    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
        .domain(platforms)
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(postTypes)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]) // Scale based on max likes
        .nice()
        .range([height, 0]);

    // Define color scale for post types
    const color = d3.scaleOrdinal()
        .domain(postTypes)
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add scales x0 and y     
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Platforms");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .style("text-anchor", "middle")
        .text("Average Likes");

    // Add title    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Bar Chart for Average Number of Likes for each Post Type across Platforms");
        

    // Group container for bars
    const barGroups = svg.selectAll(".platform-group")
        .data(platforms)
        .enter().append("g")
        .attr("class", "platform-group")
        .attr("transform", d => `translate(${x0(d)},0)`);

    // Draw bars
    barGroups.selectAll("rect")
        .data(d => data.filter(row => row.Platform === d)) // Filter for each platform
        .enter().append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.Likes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.Likes))
        .attr("fill", d => color(d.PostType));


    // Add the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 120}, ${margin.top})`);

    postTypes.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type))
            .style("stroke", "black") 
            .style("stroke-width", 1);

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

// Set up dimensions and margins
const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.Likes = +d.Likes 
    });

    // Define the dimensions and margins for the SVG
    let
      width = 600,
      height = 500;
    
    let margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }

    // Create the SVG container
    let svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'thistle')
            

  let yscale = d3.scaleLinear()
                .domain([400, 560])
                .range([height - margin.bottom, margin.top])
  
  let xscale = d3.scaleBand()
                .domain(data.map(d => d.Date))
                .range([margin.left, width - margin.right])   
                .padding(0.5)           
  
  let yaxis = svg.append('g')
                .call(d3.axisLeft().scale(yscale))
                .attr('transform', `translate(${margin.left} , 0)`)
                
  let xaxis = svg.append('g')
                .call(d3.axisBottom().scale(xscale))
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .selectAll("text") 
                .style("text-anchor", "end") 
                .attr("dx", "-0.8em") 
                .attr("dy", "0.15em") 
                .attr("transform", "rotate(-20)"); 

  
  //Draw the labels
  svg.append('text')
    .text('Name')
    .attr('x', width/2)
    .attr('y', height - 15)
    .attr('transform', 'rotate(-90)')
  
  svg.append('text')
    .text('Average Number of Likes')
    .attr('x', 0-height/2)
    .attr('y', 25)
    .attr('transform', 'rotate(-90)')

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Line Plot for Average Number of likes for 3/1 - 3/7");

  let line = d3.line()
              .x(d => xscale(d.Date) +xscale.bandwidth()/2)
              .y(d => yscale(d.Likes))
              .curve(d3.curveNatural)
  
  let path = svg.append('path')
                .datum(data)
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', '#DC143C')
                .attr('stroke-width', 2)
});
