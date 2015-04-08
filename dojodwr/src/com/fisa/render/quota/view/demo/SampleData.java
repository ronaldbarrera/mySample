package com.fisa.render.quota.view.demo;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import com.fisa.render.quota.view.model.GroupT;
import com.fisa.render.quota.view.model.QuotaData;
import com.fisa.render.quota.view.model.ViewDataQPV;

public class SampleData {
	public static ViewDataQPV baseData(){
		ViewDataQPV v = new ViewDataQPV();
		v.setCodePackage("1");
		v.setNamePackage("Paquete de Limite y Transacciones de Banca Empresas");
		v.setApplyTo("Empresas");
		return v;
	}
	
	public static ViewDataQPV baseData2(){
		ViewDataQPV v = new ViewDataQPV();
		v.setCodePackage("6");
		v.setNamePackage("Paquete de Prueba de Cupos");
		v.setApplyTo("Personas");
		return v;
	}
	
	public static List<GroupT> gruposTransaccionales(){
		GroupT og = new GroupT();
		og.setCode("transferencia");
		og.setName("Transferencia");
		
		GroupT og2 = new GroupT();
		og2.setCode("pagos");
		og2.setName("Pagos");
		
		List<GroupT> resp = new ArrayList<GroupT>();
		resp.add(og);
		resp.add(og2);
		return resp;
	}
	
	public static QuotaData[] arrayCupos_Transferencia(){
		QuotaData arrCupos[] = new QuotaData[2];
		QuotaData obj1 = new QuotaData();
		obj1.setGroup_code("transferencia");
		obj1.setQuota("Limite Diario");
		obj1.setMaxQuota(new BigDecimal(SampleData.randBetween(1000, 50000)));
		obj1.setCurrency("DOLAR");
		obj1.setDefaultQuota(45.253);
		obj1.setMaxNumTransac(SampleData.randBetween(100, 5666));
		obj1.setDefaultNumTransac(SampleData.randBetween(100, 5666));
		obj1.setStarDate(SampleData.fechaRandom(2016));
		obj1.setValidityTo(SampleData.fechaRandom(2020));
		
		QuotaData obj2 = new QuotaData();
		obj2.setGroup_code("transferencia");
		obj2.setQuota("Limite Semanal");
		obj2.setMaxQuota(new BigDecimal(SampleData.randBetween(1000, 50000)));
		obj2.setCurrency("DOLAR");
		obj2.setDefaultQuota(1452.3);
		obj2.setMaxNumTransac(SampleData.randBetween(100, 5666));
		obj2.setDefaultNumTransac(SampleData.randBetween(100, 5666));
		obj2.setStarDate(SampleData.fechaRandom(2016));
		obj2.setValidityTo(SampleData.fechaRandom(2020));
		
		arrCupos[0] = obj1;
		arrCupos[1] = obj2;
		
		return arrCupos;
	}
	
	public static QuotaData[] arrayCupos_Pagos(){
		QuotaData arrCupos[] = new QuotaData[1];
		QuotaData obj3 = new QuotaData();
		obj3.setGroup_code("pagos");
		obj3.setQuota("Limite Quincenal");
		obj3.setMaxQuota(new BigDecimal(SampleData.randBetween(1000, 50000)));
		obj3.setCurrency("DOLAR");
		obj3.setDefaultQuota(1452.3);
		obj3.setMaxNumTransac(SampleData.randBetween(100, 5666));
		obj3.setDefaultNumTransac(SampleData.randBetween(100, 5666));
		obj3.setStarDate(SampleData.fechaRandom(2016));
		obj3.setValidityTo(SampleData.fechaRandom(2020));
		arrCupos[0] = obj3;
		return arrCupos;
	}
	

	public static Date fechaRandom(int maxYear) {
        GregorianCalendar gc = new GregorianCalendar();
        int year = randBetween(2000, maxYear);
        gc.set(gc.YEAR, year);
        int dayOfYear = randBetween(1, gc.getActualMaximum(gc.DAY_OF_YEAR));
        gc.set(gc.DAY_OF_YEAR, dayOfYear);
        System.out.println(gc.get(gc.YEAR) + "-" + gc.get(gc.MONTH) + "-" + gc.get(gc.DAY_OF_MONTH));
        return gc.getTime();
    }

    public static int randBetween(int start, int end) {
        return start + (int)Math.round(Math.random() * (end - start));
    }
	
	public static void main(String[] args) {
		
	}
}
