import { validateDescription, validateName } from '../Assertions';

export class SharedNameAndDescription {
	public name!: string;
	public description!: string;

	/**
	 * Sets the name
	 * @param name The name
	 */
	public setName(name: string) {
		// Assert the name matches the conditions
		validateName(name);

		this.name = name;

		return this;
	}

	/**
	 * Sets the description
	 * @param description The description
	 */
	public setDescription(description: string) {
		// Assert the description matches the conditions
		validateDescription(description);

		this.description = description;

		return this;
	}
}
