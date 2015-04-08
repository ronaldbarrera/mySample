package com.fisa.render.quota.view.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import com.fisa.render.quota.view.demo.SampleData;
import com.fisa.render.quota.view.model.GroupT;
import com.fisa.render.quota.view.model.QuotaData;
import com.fisa.render.quota.view.model.ViewDataQPV;

public class ViewServiceDVQuotaP {
	
	public ViewDataQPV getdata(){
		return SampleData.baseData();
	}
	
	public String sayHello(String name)
    {
		System.out.println("Hello, " + name);
        return "Hello, " + name;
    }
	
	public Collection<ViewDataQPV> getPackages(){
		List<ViewDataQPV> lista = new ArrayList<ViewDataQPV>();
		//package
		ViewDataQPV itemData = SampleData.baseData();
		//grupos
		itemData.setGroups(SampleData.gruposTransaccionales().toArray(new GroupT[]{}));
		//cupos
		QuotaData[] quosTransfer = SampleData.arrayCupos_Transferencia();
		QuotaData[] quosPagos = SampleData.arrayCupos_Pagos();
		Collection<QuotaData> tempo  = new ArrayList<QuotaData>();
		tempo.addAll(Arrays.asList(quosTransfer));
		tempo.addAll(Arrays.asList(quosPagos));
		itemData.setQuotaDataList(tempo.toArray(new QuotaData[] {}));
		//fin
		lista.add( itemData );
		System.out.println(""+ new Date() +" "+lista);
		Collection<ViewDataQPV> collection = lista;
		return collection;
	}
}
