package com.fisa.render.limit.dwr;

import java.util.Date;
import java.util.List;

import com.fisa.render.limit.model.LimitView;
import com.fisa.render.quota.view.demo.Samples;


public class LimitValuePackageClientDWR{
	 
	
	
	public String hiFisa(String name)
    {
        return "Hello Fisa Client, by " + name;
    }

	public List<LimitView> getViewData(String name){
		System.out.println(name+ new Date());
		return Samples.getData2();
	}
}
