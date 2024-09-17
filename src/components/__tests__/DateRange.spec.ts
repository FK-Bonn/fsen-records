import {describe, expect, it} from 'vitest'

import {mount} from '@vue/test-utils'
import DateRange from "../DateRange.vue";
import {Interval} from "../../Calculator";

describe('DateRange', () => {
  it('renders properly', () => {
    const interval: Interval = Interval.fromStrings('2020-01-01', '2020-12-31') as Interval;
    const wrapper = mount(DateRange, { props: { interval } })
    expect(wrapper.text()).toContain('01.01.2020 – 31.12.2020')
  })
})
