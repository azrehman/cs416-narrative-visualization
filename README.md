# cs416-narrative-visualization

## Explore Stock Markets Around The World

Abdullah Rehman


### dataset

<https://www.kaggle.com/datasets/mattiuzc/stock-exchange-data?select=indexProcessed.csv>

>Daily price data for indexes tracking stock exchanges from all over the world (United States, China, Canada, Germany, Japan, and more). The data was all collected from Yahoo Finance, which had several decades of data available for most exchanges.

- **Messaging:** What is the message you are trying to communicate with the narrative visualization?

	The message I am trying to communicate with my narrative visualization is how different stock exchanges around the world have aligned and differed with each other throughout history. 

- **Narrative Structure:** Which structure was your narrative visualization designed to follow (martini glass, interactive slide show or drop-down story)? How does your narrative visualization follow that structure? (All of these structures can include the opportunity to "drill-down" and explore. The difference is where that opportunity happens in the structure.)

	To help accomplish my message, I chose to use the Martini-lass narrative structure. My visualization exhibits the martini glass narrative structure by first having four author driven scenes, and then one user driver scene for further exploration.

	In the first four author driven scenes, I display a specific stock exchange and give the user a short background on the exchange. I also prove a link to an external Investopedia webpage for more information about the exchange.

	After viewing the first four scenes which contain info on the biggest stock exchanges, the user has a chance to "drill-down" on the fifth and last page.
	This page allows the user to select any available stock exchange they are interested in to explore. Furthermore, the fifth page allows the user to select and plot multiple stock exchanges so they can compare them at the same time. This additional functionality is achieved by having the user interact with a drop-down selection button. True to the Martini-glass design, the last page offers the most exploration opportunity for the user.

- **Visual Structure:** What visual structure is used for each scene? How does it ensure the viewer can understand the data and navigate the scene? How does it highlight to urge the viewer to focus on the important parts of the data in each scene? How does it help the viewer transition to other scenes, to understand how the data connects to the data in other scenes?

	The main visual structure for my project is the use of line charts. Each line chart has a common layout, color-scheme, and labels so the user is familiar in each scene and not disoriented. The line charts are clearly visible and stand out. I draw the user to certain areas of the line chart using highlighted annotations. The line charts support zoom, and contain tool-tips so the user can easily see the exact values.

	The scenes are linked together using large and well-labeled buttons. Pressing a button changes the scene according to its label. The user knows exactly what kind of data they will see plotted on the scene since the button's label removes any ambiguity. when pressing a button due to the label. 
	
	Furthermore, the button for the next scene only reveals once the previous scene has been rendered. So the user is unable to jump around scenes when viewing the visualization for the first time. This ensures the user follows the author driven ordering of the scenes in the Martini-glass design and isn't confused on what scene to progress to next. However, it gives the user free-reign to go to any scene after traversing the visualization once.

- **Scenes:** What are the scenes of your narrative visualization? How are the scenes ordered, and why

	I have five scenes in my narrative visualization. The first four scenes are author driven where I chose to chart stock exchange data for the biggest and most familiar stock exchanges in different regions. I chose the specific ordering to show the user how different region's economies compared and contrasted over time. Since, my visualization uses the Martini-glass pattern, my final scene is lets the user select any combination of exchanges and compare them at the same time to drill down on the differences and similarities. 

- **Annotations:** What template was followed for the annotations, and why that template? How are the annotations used to support the messaging? Do the annotations change within a single scene, and if so, how and why

To create my annotations I used the [d3-annotation](https://d3-annotation.susielu.com/) library by Susie Lu to use as a template for my annotations. The library proves attributes like title, and annotation width so I can label sections of my charts.

My annotations provide much needed context for explaining the events that caused the big downward spikes leading to a crash in stock price. My annotations are the same in each scene but correctly align with each chart's X-axis (date) and automatically disappear if the user zooms in since they are meant to give a high level overview.

In each chart, they bring the reader's attention to bear markets that they may otherwise not have known the cause for.

- **Parameters:** What are the parameters of the narrative visualization? What are the states of the narrative visualization? How are the parameters used to define the state and each scene?

	My visualization uses a lot of parameters. The main parameters are the one used by plot function- `marketData` and `title`. 

	`marketData` is a parameter for which exchange to plot on the given scene. `title` is a parameter to add a title to the line chart. The plot function uses these parameters to render the appropriate scene.

	In the last scene, a selection parameter is used to get the user's chosen stock exchange value from the dropdown list. Then the plot function appends a line chart for each selection the user makes.


- **Triggers:** What are the triggers that connect user actions to changes of state in the narrative visualization? What affordances are provided to the user to communicate to them what options are available to them in the narrative visualization?

	- Button clicks:
    	- Allow for the scene to change
        	- Affordance: Distinguished from plaintext using CSS to make interactivity obvious.
        	- Affordance: Buttons remain hidden until they are allowed to be clicked.
  	- Select dropdown menu events:
    	- Triggers d3 to plot the stock exchange data for user-selected market
          - Affordance: Distinguished from plaintext using CSS to make interactivity obvious.
  	- Mouse move/hover events:
    	- Updates the tooltip popup to display the exact date and price.
        	- Affordance: User can hover anywhere on line-chart to display tooltip. Don't have to be directly on top of the line.
  	- Mouse leave events:
    	- Removes tooltip popup when user's mouse leaves the SVG window
  	- Mouse drag events:
    	- Zooms in selected area in line-chart
        	- Affordance: Tip provided to explain functionality.
  	- Mouse double click events:
    	- Resets zoom level.
        - Affordance: Tip provided to explain functionality.
