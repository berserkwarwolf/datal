Data Source
<dataSource>
	<DataStructure>
		<Field id="table0">
			<type/>
			<format>
				<languaje/>
				<country/>
				<style/>
			</format>
			<Table>
				<Field id="column0">
					<alias/>
					<type/>
					<format>
						<languaje/>
						<country/>
						<style/>
					</format>
				</Field>
				<Field id="column1">
					<alias/>
					<type/>
					<format>
						<languaje/>
						<country/>
						<style/>
					</format>
				</Field>
				<Field id="column2">
					<alias/>
					<type/>
					<format>
						<languaje/>
						<country/>
						<style/>
					</format>
				</Field>
			</Table>
		</Field>
	</DataStructure>
</dataSource>




# Select Statement


## Full Table
<selectStatement>
	<Select>
		<Column>*</Column>
	</Select>
	<From>
		<Table>table0</Table>
	</From>
	<Where/>
</selectStatement>


## Coumna A, C, Fila 2 y 3
<selectStatement>
	<Select>
		<Column>column0</Column>
		<Column>column2</Column>
	</Select>
	<From>
		<Table>table0</Table>
	</From>
	<Where>
		<Filter>
			<Operand1>rownum</Operand1>
			<LogicalOperator>00</LogicalOperator>
			<Operand2>1</Operand2>
		</Filter>
		<Filter>
			<Operand1>rownum</Operand1>
			<LogicalOperator>00</LogicalOperator>
			<Operand2>2</Operand2>
		</Filter>
	</Where>
</selectStatement>


## Celdas B2, C2, A3
<selectStatement>
	<Select>
		<Column>cell4</Column>
		<Column>cell5</Column>
		<Column>cell6</Column>
	</Select>
	<From>
		<Table>table0</Table>
	</From>
	<Where/>
</selectStatement>